import { validationResult } from "express-validator";
import News from "../models/News.js";

// Crear noticia
export async function createNews(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors en createNews:", errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, content, summary } = req.body;
    const news = new News({ title, content, summary });
    await news.save();
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    console.error("Error en createNews:", error.message);
    next(error);
  }
}

// Listar noticias
export async function getNews(req, res, next) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { content: new RegExp(search, "i") } : {};
    const news = await News.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: news });
  } catch (error) {
    console.error("Error en getNews:", error.message);
    next(error);
  }
}

// Obtener noticia por ID
export async function getNewsById(req, res, next) {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: "Noticia no encontrada" });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    console.error("Error en getNewsById:", error.message);
    next(error);
  }
}

// Actualizar noticia
export async function updateNews(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors en updateNews:", errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { title, content, summary } = req.body;
    const news = await News.findByIdAndUpdate(
      id,
      { title, content, summary },
      { new: true, runValidators: true }
    );
    if (!news) {
      return res.status(404).json({ success: false, message: "Noticia no encontrada" });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    console.error("Error en updateNews:", error.message);
    next(error);
  }
}

// Eliminar noticia
export async function deleteNews(req, res, next) {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndDelete(id);
    if (!news) {
      return res.status(404).json({ success: false, message: "Noticia no encontrada" });
    }
    res.json({ success: true, message: "Noticia eliminada correctamente" });
  } catch (error) {
    console.error("Error en deleteNews:", error.message);
    next(error);
  }
}