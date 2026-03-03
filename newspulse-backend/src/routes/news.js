import express from "express";
import { newsController, searchController } from "../config/di.js";
import { body } from "express-validator";
import auth from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.js";

const router = express.Router();

// Validadores reutilizables
const newsValidators = [
  body("title").notEmpty().withMessage("El título es obligatorio"),
  body("content")
    .isLength({ min: 10 })
    .withMessage("El contenido debe tener al menos 10 caracteres"),
];

// Crear noticia
router.post(
  "/",
  auth,
  authorizeRoles("admin", "editor"),
  newsValidators,
  (req, res, next) => newsController.create(req, res, next)
);

// Obtener noticias globales
router.get("/global", (req, res, next) =>
  newsController.getGlobalNews(req, res, next)
);

// Listar noticias
router.get("/", (req, res, next) => newsController.list(req, res, next));

// Endpoint para búsqueda - sin caché HTTP
router.get("/search", (req, res, next) => {
  // Limpiar headers de caché condicional
  delete req.headers['if-none-match'];
  delete req.headers['if-modified-since'];
  
  // Establecer headers explícitos contra caché
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('ETag', '');
  
  searchController.basicSearch(req, res, next);
});

// Obtener noticia por ID
router.get("/:id", (req, res, next) =>
  newsController.getById(req, res, next)
);

// Actualizar noticia por ID
router.put(
  "/:id",
  auth,
  authorizeRoles("admin", "editor"),
  newsValidators,
  (req, res, next) => newsController.update(req, res, next)
);

// Eliminar noticia por ID
router.delete("/:id", auth, authorizeRoles("admin", "editor"), (req, res, next) =>
  newsController.delete(req, res, next)
);

// Endpoint para resumir una noticia específica con IA
router.post("/:id/summarize", (req, res, next) =>
  newsController.summarizeOneNews(req, res, next)
);

// Endpoint para obtener noticias por categoría
router.get("/category/:name", (req, res, next) =>
  newsController.getNewsByCategory(req, res, next)
);

export default router;