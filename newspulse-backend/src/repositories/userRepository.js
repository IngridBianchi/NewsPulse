/**
 * Repositorio de Usuarios - Encapsula acceso a datos de User
 * @param {Model} UserModel - Modelo Mongoose de User
 * @returns {Object} Interfaz de repositorio
 */
export function createUserRepository(UserModel) {
  return {
    /**
     * Crear un usuario
     */
    async create(data) {
      const user = new UserModel(data);
      return await user.save();
    },

    /**
     * Encontrar usuario por email
     */
    async findByEmail(email) {
      return await UserModel.findOne({ email });
    },

    /**
     * Encontrar usuario por ID
     */
    async findById(id) {
      return await UserModel.findById(id);
    },

    /**
     * Encontrar usuario por ID con historial poblado
     */
    async findByIdWithHistory(id) {
      return await UserModel.findById(id).populate("readHistory");
    },

    /**
     * Actualizar usuario por ID
     */
    async updateById(id, updates) {
      return await UserModel.findByIdAndUpdate(id, updates, { new: true });
    },

    /**
     * Eliminar usuario por ID
     */
    async deleteById(id) {
      return await UserModel.findByIdAndDelete(id);
    },

    /**
     * Agregar noticia al historial de lectura
     */
    async addToReadHistory(userId, newsId) {
      return await UserModel.updateOne(
        { _id: userId },
        { $push: { readHistory: newsId } }
      );
    },

    /**
     * Actualizar preferencias de categorías
     */
    async updateCategoryPreferences(userId, categoryPreferences) {
      return await UserModel.findByIdAndUpdate(
        userId,
        { categoryPreferences },
        { new: true }
      );
    },
  };
}
