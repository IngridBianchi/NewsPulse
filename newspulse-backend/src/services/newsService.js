import News from "../models/News.js";

/**
 * Crear una noticia
 */
export async function createNews({ title, content, summary, author }) {
  const news = new News({ title, content, summary, author });
  return await news.save();
}

/**
 * Listar noticias con paginación y filtros
 */
export async function getNews({ page = 1, limit = 10, search = "" }) {
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
    News.find(query).sort({ date: -1 }).skip(skip).limit(limit),
    News.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}


/**
 * Obtener noticia por ID
 */
export async function getNewsById(id) {
  return await News.findById(id);
}

/**
 * Actualizar noticia por ID
 */
export async function updateNews(id, data) {
  return await News.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Eliminar noticia por ID
 */
export async function deleteNews(id) {
  return await News.findByIdAndDelete(id);
}