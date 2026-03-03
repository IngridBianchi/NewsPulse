/**
 * Controlador de Búsqueda - Factory
 * @param {Object} newsService - Servicio de noticias inyectado
 * @returns {Object} Controlador con métodos
 */
export function createSearchController(newsService) {
  return {
    async basicSearch(req, res, next) {
      try {
        const query = req.query.q;
        if (!query) {
          return res
            .status(400)
            .json({ success: false, error: "Falta parámetro q" });
        }

        const results = await newsService.search(query);
        console.log(`Search for "${query}" returned ${results.length} results`);
        
        // Forzar status 200 explícito y desabilitar caché
        return res
          .status(200)
          .set('Cache-Control', 'no-cache, no-store, must-revalidate')
          .set('Pragma', 'no-cache')
          .set('Expires', '0')
          .json({ success: true, data: results });
      } catch (error) {
        console.error(`Search error for query "${req.query.q}":`, error);
        next(error);
      }
    },
  };
}
