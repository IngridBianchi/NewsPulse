import { validationResult } from "express-validator";
import * as newsService from "../services/newsService.js";
import { summarizeText } from "../services/aiService.js";


// Crear noticia
export async function createNews(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, content, author } = req.body;
    const summary = await summarizeText(content);

    const news = await newsService.createNews({ title, content, summary, author });
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    console.error("Error en createNews:", error.message);
    next(error); // delega al middleware global
  }
}


// Listar noticias
export async function getNews(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await newsService.getNews({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

// Obtener noticia por ID
export async function getNewsById(req, res, next) {
  try {
    const news = await newsService.getNewsById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: "Noticia no encontrada" });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
}

// Actualizar noticia por ID
export async function updateNews(req, res, next) {
  try {
    const updated = await newsService.updateNews(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Noticia no encontrada" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// Eliminar noticia por ID
export async function deleteNews(req, res, next) {
  try {
    const deleted = await newsService.deleteNews(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Noticia no encontrada" });
    }
    res.json({ success: true, message: "Noticia eliminada correctamente" });
  } catch (error) {
    next(error);
  }
}

