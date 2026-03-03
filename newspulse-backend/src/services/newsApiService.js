import axios from "axios";

const BASE_URL = "https://newsapi.org/v2/everything";
const queries = ["politica", "deportes", "tecnologia", "cultura", "economia"];
const CATEGORY_BY_QUERY = {
  politica: "Política",
  deportes: "Deportes",
  tecnologia: "Tecnología",
  cultura: "Cultura",
  economia: "Economía",
};

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
        const API_KEY = process.env.NEWS_API_KEY;
        const promises = queries.map((q) =>
          axios.get(BASE_URL, {
            params: {
              q,
              language: "es",
              sortBy: "publishedAt",
              pageSize: 5,
            },
            headers: {
              "X-Api-Key": API_KEY,
            },
          })
        );

        const responses = await Promise.all(promises);
        const articles = responses.flatMap((response, index) => {
          const query = queries[index];
          const category = CATEGORY_BY_QUERY[query] || "General";
          return response.data.articles.map((article, itemIndex) => ({
            ...article,
            __category: category,
            __fallbackUrl: `${query}-${itemIndex}-${article.publishedAt || Date.now()}`,
          }));
        });

        // Guardado en paralelo para acelerar refresh de trending
        const persistedArticles = await Promise.all(
          articles.map(async (article) => {
            try {
              const url = article.url || article.__fallbackUrl;
              return await newsRepo.findOrCreate(
                { url },
                {
                  title: article.title || "Sin título",
                  content:
                    article.content ||
                    article.description ||
                    article.title ||
                    "Contenido no disponible",
                  summary: article.description || "",
                  url,
                  urlToImage: article.urlToImage,
                  publishedAt: article.publishedAt,
                  sourceName: article.source?.name,
                  category: article.__category,
                }
              );
            } catch (err) {
              console.error(`Error procesando artículo ${article.url}:`, err.message);
              return null;
            }
          })
        );

        // Evitar duplicados por _id (un artículo puede venir en varias queries)
        const unique = [];
        const seenIds = new Set();
        for (const item of persistedArticles) {
          if (!item) continue;
          const id = String(item._id);
          if (!seenIds.has(id)) {
            seenIds.add(id);
            unique.push(item);
          }
        }

        unique.sort(
          (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
        );

        return unique;
      } catch (err) {
        console.error("Error en fetchAndSaveGlobalNews:", err.message);
        throw err;
      }
    },
  };
}
