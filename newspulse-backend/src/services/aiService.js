import fetch from "node-fetch";

/**
 * Servicio de IA - Resumen de texto con Hugging Face
 * @returns {Object} Interfaz del servicio
 */
export function createAiService() {
  return {
    /**
     * Resumir texto usando IA
     */
    async summarizeText(text) {
      try {
        const HF_TOKEN = process.env.HF_TOKEN;
        if (!HF_TOKEN) {
          throw new Error("HF_TOKEN no configurado");
        }

        // Primer intento: modelo principal
        let response = await fetch(
          "https://router.huggingface.co/hf-inference/models/philschmid/bart-large-cnn-samsum",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
          }
        );

        if (!response.ok) {
          throw new Error(`Modelo principal no respondió: ${response.status}`);
        }

        let result = await response.json();

        if (result.error) {
          console.error("Error en Hugging Face (modelo principal):", result.error);
          throw new Error("Error al generar resumen con IA (modelo principal)");
        }

        return result[0]?.summary_text || "No se recibió resumen";
      } catch (err) {
        console.warn("Fallo modelo principal, probando fallback:", err.message);

        // Segundo intento: modelo de respaldo
        try {
          const HF_TOKEN = process.env.HF_TOKEN;
          const response2 = await fetch(
            "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ inputs: text }),
            }
          );

          if (!response2.ok) {
            throw new Error(`Modelo fallback no respondió: ${response2.status}`);
          }

          const result2 = await response2.json();

          if (result2.error) {
            console.error("Error en Hugging Face (fallback):", result2.error);
            throw new Error("Error al generar resumen con IA (fallback)");
          }

          return result2[0]?.summary_text || "No se recibió resumen (fallback)";
        } catch (err2) {
          console.error("Error en summarizeText (fallback):", err2.message);
          throw err2;
        }
      }
    },
  };
}