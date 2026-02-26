import { validationResult } from "express-validator";

/**
 * Controlador de Noticias - Factory
 * @param {Object} newsService - Servicio inyectado
 * @param {Object} newsApiService - Servicio API inyectado
 * @param {Object} summarizerService - Servicio de resumen inyectado
 * @returns {Object} Controlador con métodos
 */
export function createNewsController(newsService, newsApiService, summarizerService) {
  return {
    async create(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      try {
        const news = await newsService.create(req.body);
        res.status(201).json({ success: true, data: news });
      } catch (error) {
        next(error);
      }
    },

    async list(req, res, next) {
      try {
        const result = await newsService.list(req.query);
        res.json({ success: true, ...result });
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const news = await newsService.getById(req.params.id);
        if (!news) {
          return res
            .status(404)
            .json({ success: false, message: "Noticia no encontrada" });
        }
        res.json({ success: true, data: news });
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      try {
        const news = await newsService.update(req.params.id, req.body);
        if (!news) {
          return res
            .status(404)
            .json({ success: false, message: "Noticia no encontrada" });
        }
        res.json({ success: true, data: news });
      } catch (error) {
        next(error);
      }
    },

    async delete(req, res, next) {
      try {
        const news = await newsService.delete(req.params.id);
        if (!news) {
          return res
            .status(404)
            .json({ success: false, message: "Noticia no encontrada" });
        }
        res.json({ success: true, message: "Noticia eliminada correctamente" });
      } catch (error) {
        next(error);
      }
    },

    async getGlobalNews(req, res, next) {
      try {
        const articles = await newsApiService.fetchAndSaveGlobalNews();
        res.json({ success: true, total: articles.length, data: articles });
      } catch (error) {
        next(error);
      }
    },

    async summarizeOneNews(req, res, next) {
      try {
        const { id } = req.params;
        const updatedNews = await summarizerService.summarizeNewsById(id);
        res.json({ success: true, data: updatedNews });
      } catch (error) {
        next(error);
      }
    },

    async getNewsByCategory(req, res, next) {
      try {
        const category = req.params.name;
        const news = await newsService.getByCategory(category);

        if (!news || news.length === 0) {
          return res.status(404).json({
            success: false,
            message: `No se encontraron noticias en la categoría ${category}`,
          });
        }

        res.json({
          success: true,
          count: news.length,
          data: news,
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
