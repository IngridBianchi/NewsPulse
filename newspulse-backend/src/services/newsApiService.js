import axios from "axios";

const BASE_URL = "https://newsapi.org/v2/everything";
const API_KEY = process.env.NEWS_API_KEY;
const queries = ["politica", "deportes", "tecnologia", "cultura", "economia"];

/**
 * Servicio de NewsAPI - Inyección de repositorio y clasificador
 * @param {Object} newsRepo - Repositorio de noticias
 * @param {Object} classifierService - Servicio para clasificar noticias
 * @returns {Object} Interfaz del servicio
 */
export function createNewsApiService(newsRepo, classifierService) {
  return {
    /**
     * Obtener y guardar noticias globales desde NewsAPI
     */
    async fetchAndSaveGlobalNews() {
      try {
        // Obtener artículos por cada tema
        const promises = queries.map((q) =>
          axios.get(BASE_URL, {
            params: {
              q,
              language: "es",
              sortBy: "publishedAt",
              pageSize: 5,
              apiKey: API_KEY,
            },
          })
        );

        const results = await Promise.all(promises);
        const articles = results.flatMap((r) => r.data.articles);

        // Procesar y guardar artículos con clasificación
        for (const article of articles) {
          try {
            // Clasificar el artículo
            const category = await classifierService.classifyNews(
              article.content || article.description || article.title
            );

            // Guardar en BD
            await newsRepo.findOrCreate(
              { url: article.url },
              {
                title: article.title,
                content: article.content || article.description,
                summary: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                sourceName: article.source?.name,
                category: category,
              }
            );
          } catch (err) {
            console.error(`Error procesando artículo ${article.url}:`, err.message);
            // Continuar con el siguiente artículo
          }
        }

        return articles;
      } catch (err) {
        console.error("Error en fetchAndSaveGlobalNews:", err.message);
        throw err;
      }
    },
  };
}
