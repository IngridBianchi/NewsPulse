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
  };
}