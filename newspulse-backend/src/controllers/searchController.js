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
        res.json({ success: true, data: results });
      } catch (error) {
        next(error);
      }
    },
  };
}
