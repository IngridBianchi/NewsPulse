import fetch from "node-fetch";

/**
 * Servicio de Clasificación de Noticias - Usar Hugging Face
 * @returns {Object} Interfaz del servicio
 */
export function createNewsClassifierService() {
  return {
    /**
     * Clasificar una noticia en una categoría temática
     */
    async classifyNews(text) {
      const HF_TOKEN = process.env.HF_TOKEN;
      if (!HF_TOKEN) {
        console.warn("HF_TOKEN no definido, asignando categoría 'General'");
        return "General";
      }

      try {
        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/joeddav/xlm-roberta-large-xnli",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: text,
              parameters: {
                candidate_labels: [
                  "Política",
                  "Economía",
                  "Cultura",
                  "Deportes",
                  "Tecnología",
                  "Sociedad",
                ],
              },
            }),
          }
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Respuesta no JSON de Hugging Face:", text);
          return "General";
        }

        const result = await response.json();

        if (result.error) {
          console.error("Error en Hugging Face:", result.error);
          return "General";
        }

        if (result.labels && result.labels.length > 0) {
          return result.labels[0];
        }

        console.warn("No se recibieron categorías, asignando 'General'");
        return "General";
      } catch (err) {
        console.error("Error en classifyNews:", err.message);
        return "General";
      }
    },
  };
}
