import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Registrar un nuevo usuario
 */
export async function registerUser({ name, email, password, role = "lector" }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("El email ya está registrado");
  }

  // 👇 Guardamos la contraseña en texto plano, el pre("save") la encripta
  const user = new User({ name, email, password, role });
  return await user.save();
}

/**
 * Login de usuario
 */
export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  // 👇 Comparamos la contraseña ingresada con el hash guardado
  const bcrypt = await import("bcryptjs");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { user, token };
}