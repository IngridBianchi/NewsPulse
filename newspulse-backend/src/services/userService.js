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

      // Convertir categoryPreferences a un formato que podamos procesar
      let prefs = {};
      if (user.categoryPreferences instanceof Map) {
        prefs = Object.fromEntries(user.categoryPreferences);
      } else if (user.categoryPreferences && typeof user.categoryPreferences === 'object') {
        prefs = user.categoryPreferences;
      }

      // Categorías ordenadas por preferencia del usuario
      const preferredCategories = Object.entries(prefs)
        .sort((a, b) => b[1] - a[1])
        .map(([cat]) => cat);

      // Obtener IDs de noticias leídas
      const readHistoryIds = user.readHistory
        .map((item) => (typeof item === 'string' ? item : item._id))
        .filter(Boolean);

      if (!newsRepo) {
        return [];
      }

      // Intentar obtener recomendaciones de la categoría favorita, luego de otras
      const recommendations = await newsRepo
        .find({
          category: { $in: preferredCategories.length > 0 ? preferredCategories : ['Política', 'Economía', 'Cultura', 'Deportes', 'Tecnología', 'Sociedad', 'General'] },
          _id: { $nin: readHistoryIds },
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
      // add the news reference itself
      const result = await userRepo.addToReadHistory(userId, newsId);

      // update category preferences so we can compute favourites later
      try {
        const news = await newsRepo.findById(newsId);
        if (news && news.category) {
          const user = await userRepo.findById(userId);
          if (user) {
            const prefs = user.categoryPreferences || {};
            // Ensure it's a plain object, not a Map
            let prefsObj = {};
            if (prefs instanceof Map) {
              prefsObj = Object.fromEntries(prefs);
            } else if (typeof prefs === 'object') {
              prefsObj = prefs;
            }
            const current = prefsObj[news.category] || 0;
            prefsObj[news.category] = (prefsObj[news.category] || 0) + 1;
            await userRepo.updateCategoryPreferences(userId, prefsObj);
          }
        }
      } catch (err) {
        // silently ignore failures updating preferences
        console.error('Failed to update category preferences', err);
      }

      return result;
    },
  };
}
