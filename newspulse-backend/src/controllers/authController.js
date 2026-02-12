import { validationResult } from "express-validator";
import * as authService from "../services/authService.js";

export async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser({ name, email, password, role });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error("Error en register:", error.message);
    next(error);
  }
}

export async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    console.error("Error en login:", error.message);
    next(error);
  }
}