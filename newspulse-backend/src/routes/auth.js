import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Registro
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

export default router;