const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Crear noticia
router.post('/', newsController.createNews);

// Listar noticias
router.get('/', newsController.getNews);

module.exports = router;