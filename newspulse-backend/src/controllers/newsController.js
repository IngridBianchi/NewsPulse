const News = require("../models/News");
const { validationResult } = require("express-validator");
const { generateSummary } = require("../services/ai");

// Crear noticia
exports.createNews = async (req, res, next) => {
  // Validación de campos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, content } = req.body;

    // Generar resumen con IA
    const summary = await generateSummary(content);

    const news = new News({ title, content, summary });
    await news.save();

    res.status(201).json({ success: true, data: news });
  } catch (error) {
    console.error("Error en createNews:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno al crear la noticia",
      error: error.message,
    });
  }
};

// Listar noticias
exports.getNews = async (req, res, next) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1; // página actual
    const limit = parseInt(req.query.limit) || 10; // cantidad por página
    const skip = (page - 1) * limit;

    // Consulta con paginación
    const news = await News.find().skip(skip).limit(limit).sort({ date: -1 }); // orden descendente por fecha

    // Total de documentos
    const total = await News.countDocuments();

    res.json({
      success: true,
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      items: news,
    });
  } catch (error) {
    next(error); // pasa al middleware centralizado
  }
};

// Obtener noticia por ID
exports.getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      const error = new Error("Noticia no encontrada");
      error.status = 404;
      return next(error);
    }
    res.json(news);
  } catch (error) {
    next(error);
  }
};

// Actualizar noticia por ID
exports.updateNews = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!news) {
      const error = new Error("Noticia no encontrada");
      error.status = 404;
      return next(error);
    }
    res.json(news);
  } catch (error) {
    next(error);
  }
};

// Eliminar noticia por ID
exports.deleteNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      const error = new Error("Noticia no encontrada");
      error.status = 404;
      return next(error);
    }
    res.json({ message: "Noticia eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
