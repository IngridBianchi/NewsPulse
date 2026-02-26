/**
 * Controlador de Resumen - Factory
 * @param {Object} summarizerService - Servicio de resumen inyectado
 * @returns {Object} Controlador con métodos
 */
export function createSummaryController(summarizerService) {
  return {
    async summarizeHandler(req, res, next) {
      try {
        const { text } = req.body;
        if (!text) {
          return res
            .status(400)
            .json({ success: false, message: "Falta el campo 'text'" });
        }

        const summary = await summarizerService.summarizeText(text);
        res.json({ success: true, summary });
      } catch (error) {
        next(error);
      }
    },
  };
}