const News = require("../models/News");
const { validationResult } = require("express-validator");

// Crear noticia
exports.createNews = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
