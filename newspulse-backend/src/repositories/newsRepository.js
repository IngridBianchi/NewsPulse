/**
 * Repositorio de Noticias - Encapsula acceso a datos de News
 * @param {Model} NewsModel - Modelo Mongoose de News
 * @returns {Object} Interfaz de repositorio
 */
export function createNewsRepository(NewsModel) {
  return {
    /**
     * Crear una noticia
     */
    async create(data) {
      const news = new NewsModel(data);
      return await news.save();
    },

    /**
     * Buscar noticias según criterios
     */
    find(query = {}) {
      return NewsModel.find(query);
    },

    /**
     * Encontrar noticia por ID
     */
    async findById(id) {
      return await NewsModel.findById(id);
    },

    /**
     * Actualizar noticia por ID
     */
    async updateById(id, updates) {
      return await NewsModel.findByIdAndUpdate(id, updates, { new: true });
    },

    /**
     * Eliminar noticia por ID
     */
    async deleteById(id) {
      return await NewsModel.findByIdAndDelete(id);
    },

    /**
     * Contar documentos según criterios
     */
    async countDocuments(query = {}) {
      return await NewsModel.countDocuments(query);
    },

    /**
     * Buscar o crear (upsert)
     */
    async findOrCreate(filter, data) {
      return await NewsModel.findOneAndUpdate(
        filter,
        { $set: data },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    },

    /**
     * Encontrar noticias por categoría
     */
    async findByCategory(category) {
      return await NewsModel.find({ category });
    },

     // Método para limpiar toda la colección
    async clearAll() {
      return await NewsModel.deleteMany({});
    }
  };
}
