/**
 * Servicio de Noticias - Lógica de negocio (inyección de repositorio)
 * @param {Object} newsRepo - Repositorio de noticias inyectado
 * @returns {Object} Interfaz del servicio
 */
export function createNewsService(newsRepo) {
  return {
    /**
     * Crear una noticia
     */
    async create(data) {
      return await newsRepo.create(data);
    },

    /**
     * Listar noticias con paginación y filtros
     */
    async list({ page = 1, limit = 10, search = "" }) {
      const query = search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { content: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        newsRepo.find(query).sort({ date: -1 }).skip(skip).limit(limit),
        newsRepo.countDocuments(query),
      ]);

      return {
        data,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    },

    /**
     * Buscar noticias por término
     */
    async search(query) {
      const results = await newsRepo
        .find({
          $or: [
            { title: { $regex: query, $options: "i" } },
            { content: { $regex: query, $options: "i" } },
            { summary: { $regex: query, $options: "i" } },
          ],
        })
        .sort({ publishedAt: -1 })
        .limit(10);
      return results;
    },

    /**
     * Obtener noticia por ID
     */
    async getById(id) {
      return await newsRepo.findById(id);
    },

    /**
     * Actualizar noticia por ID
     */
    async update(id, updates) {
      return await newsRepo.updateById(id, updates);
    },

    /**
     * Eliminar noticia por ID
     */
    async delete(id) {
      return await newsRepo.deleteById(id);
    },

    /**
     * Obtener noticias por categoría
     */
    async getByCategory(category) {
      return await newsRepo.findByCategory(category);
    },
  };
}