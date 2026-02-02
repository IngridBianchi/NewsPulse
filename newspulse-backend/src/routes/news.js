const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const authController = require('../controllers/authController');
const { body } = require('express-validator');


// Crear noticia
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('content').isLength({ min: 10 }).withMessage('El contenido debe tener al menos 10 caracteres')
  ],
  newsController.createNews
);

// Listar noticias
router.get('/', newsController.getNews);

// Obtener noticia por ID
router.get('/:id', newsController.getNewsById);

// Actualizar noticia por ID
router.put('/:id',
    [
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('content').isLength({ min: 10 }).withMessage('El contenido debe tener al menos 10 caracteres')
    ],
   newsController.updateNews);

// Eliminar noticia por ID
router.delete('/:id', newsController.deleteNews);

module.exports = router;