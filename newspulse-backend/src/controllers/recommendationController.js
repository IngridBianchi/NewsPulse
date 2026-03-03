/**
 * Controlador de Recomendaciones - Factory
 * @param {Object} userService - Servicio de usuarios inyectado
 * @param {Object} newsService - Servicio de noticias inyectado
 * @returns {Object} Controlador con métodos
 */
export function createRecommendationController(userService, newsService) {
  return {
    async getRecommendations(req, res, next) {
      try {
        const userId = req.user.id;
        const recommendations = await userService.getRecommendations(userId);
        res.json({ success: true, recommendations });
      } catch (error) {
        next(error);
      }
    },

    async addHistory(req, res, next) {
      try {
        const userId = req.user.id;
        const { newsId } = req.body;
        if (!newsId) {
          const error = new Error('newsId es requerido');
          error.status = 400;
          throw error;
        }
        await userService.addToReadHistory(userId, newsId);
        res.json({ success: true });
      } catch (error) {
        next(error);
      }
    },
  };
}