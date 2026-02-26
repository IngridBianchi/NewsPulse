import { validationResult } from "express-validator";

/**
 * Controlador de Autenticación - Factory
 * @param {Object} authService - Servicio de autenticación inyectado
 * @returns {Object} Controlador con métodos
 */
export function createAuthController(authService) {
  return {
    async register(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      try {
        const { name, email, password, role } = req.body;
        const user = await authService.register({ name, email, password, role });
        res.status(201).json({ success: true, data: user });
      } catch (error) {
        next(error);
      }
    },

    async login(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      try {
        const { email, password } = req.body;
        const { user, token } = await authService.login({ email, password });
        res.json({ success: true, data: { user, token } });
      } catch (error) {
        next(error);
      }
    },
  };
}