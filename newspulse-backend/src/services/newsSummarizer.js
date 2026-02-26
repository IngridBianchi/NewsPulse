/**
 * Servicio de Resumen de Noticias - Inyección de repositorio y AI
 * @param {Object} newsRepo - Repositorio de noticias
 * @param {Object} aiService - Servicio de IA (para resumir)
 * @returns {Object} Interfaz del servicio
 */
export function createNewsSummarizerService(newsRepo, aiService) {
  return {
    /**
     * Resumir una noticia específica usando IA
     */
    async summarizeNewsById(id) {
      const news = await newsRepo.findById(id);
      if (!news) {
        throw new Error("Noticia no encontrada");
      }

      const summary = await aiService.summarizeText(news.content);
      const updated = await newsRepo.updateById(id, { summary });
      return updated;
    },

    /**
     * Resumir texto arbitrary
     */
    async summarizeText(text) {
      return await aiService.summarizeText(text);
    },
  };
}