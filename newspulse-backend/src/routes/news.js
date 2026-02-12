import express from "express";
import * as newsController from "../controllers/newsController.js";
import { summarizeHandler } from "../controllers/summaryController.js";
import { body } from "express-validator";
import auth from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.js";

const router = express.Router();

// Crear noticia
router.post(
  "/",
  auth,
  authorizeRoles("admin", "editor"),
  [
    body("title").notEmpty().withMessage("El título es obligatorio"),
    body("content")
      .isLength({ min: 10 })
      .withMessage("El contenido debe tener al menos 10 caracteres"),
  ],
  newsController.createNews
);

// Listar noticias
router.get("/", newsController.getNews);

// Obtener noticia por ID
router.get("/:id", newsController.getNewsById);

// Actualizar noticia por ID
router.put(
  "/:id",
  auth,
  authorizeRoles("admin", "editor"),
  [
    body("title").notEmpty().withMessage("El título es obligatorio"),
    body("content")
      .isLength({ min: 10 })
      .withMessage("El contenido debe tener al menos 10 caracteres"),
  ],
  newsController.updateNews
);

// Eliminar noticia por ID
router.delete("/:id", auth, authorizeRoles("admin"), newsController.deleteNews);

// Endpoint independiente de IA (también accesible en /summarize)
router.post("/summarize", summarizeHandler);

export default router;