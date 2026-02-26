/**
 * Servicio de Usuarios - Lógica de negocio (inyección de repositorio)
 * @param {Object} userRepo - Repositorio de usuarios inyectado
 * @param {Object} newsRepo - Repositorio de noticias inyectado (opcional, para recomendaciones)
 * @returns {Object} Interfaz del servicio
 */
export function createUserService(userRepo, newsRepo) {
  return {
    /**
     * Registrar usuario (usa authService normalmente)
     */
    async getById(id) {
      return await userRepo.findById(id);
    },

    /**
     * Obtener recomendaciones para un usuario
     */
    async getRecommendations(userId) {
      const user = await userRepo.findByIdWithHistory(userId);

      if (!user) {
        const error = new Error("Usuario no encontrado");
        error.status = 404;
        throw error;
      }

      // Categoría más frecuente del usuario
      const topCategory = [...user.categoryPreferences.entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      if (!topCategory || !newsRepo) {
        return [];
      }

      // Noticias recomendadas (no leídas, ordenadas por fecha)
      const recommendations = await newsRepo
        .find({
          category: topCategory,
          _id: { $nin: user.readHistory.map((n) => n._id) },
        })
        .sort({ publishedAt: -1 })
        .limit(5);

      return recommendations;
    },

    /**
     * Actualizar preferencias de categorías
     */
    async updateCategoryPreferences(userId, preferences) {
      return await userRepo.updateCategoryPreferences(userId, preferences);
    },

    /**
     * Agregar noticia al historial de lectura
     */
    async addToReadHistory(userId, newsId) {
      return await userRepo.addToReadHistory(userId, newsId);
    },
  };
}
