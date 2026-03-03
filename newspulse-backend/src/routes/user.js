import express from "express";
import { recommendationController, userService } from "../config/di.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// agregar noticia al historial de lectura
router.post(
  "/history",
  auth,
  (req, res, next) => recommendationController.addHistory(req, res, next)
);

// obtener recomendaciones basadas en historial
router.get(
  "/recommendations",
  auth,
  (req, res, next) => recommendationController.getRecommendations(req, res, next)
);

export default router;
