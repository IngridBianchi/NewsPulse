import express from "express";
import { authController } from "../config/di.js";

const router = express.Router();

// Registro
router.post("/register", (req, res, next) =>
  authController.register(req, res, next)
);

// Login
router.post("/login", (req, res, next) =>
  authController.login(req, res, next)
);

export default router;