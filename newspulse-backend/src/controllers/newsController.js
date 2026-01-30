const News = require('../models/News');

// Crear noticia
exports.createNews = async (req, res) => {
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar noticias
exports.getNews = async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};