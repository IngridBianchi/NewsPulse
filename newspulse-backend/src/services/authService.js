import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

/**
 * Servicio de Autenticación - Inyección de repositorio de usuarios
 * @param {Object} userRepo - Repositorio de usuarios
 * @returns {Object} Interfaz del servicio
 */
export function createAuthService(userRepo) {
  return {
    /**
     * Registrar un nuevo usuario
     */
    async register({ name, email, password, role = "lector" }) {
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        const error = new Error("El email ya está registrado");
        error.status = 400;
        throw error;
      }

      // El pre("save") del modelo encripta la contraseña
      const user = await userRepo.create({ name, email, password, role });
      return user;
    },

    /**
     * Login de usuario
     */
    async login({ email, password }) {
      const user = await userRepo.findByEmail(email);
      if (!user) {
        const error = new Error("Credenciales inválidas");
        error.status = 401;
        throw error;
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        const error = new Error("Credenciales inválidas");
        error.status = 401;
        throw error;
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { user, token };
    },
  };
}