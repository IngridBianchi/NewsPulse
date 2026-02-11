import fetch from "node-fetch";

/**
 * Service de IA para resumir texto usando Hugging Face
 * @param {string} text - Texto a resumir
 * @returns {Promise<string>} - Resumen generado por el modelo
 */
export async function summarizeText(text) {
  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/csebuetnlp/mT5_multilingual_XLSum",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error("Error en Hugging Face:", result.error);
      throw new Error("Error al generar resumen con IA");
    }

    return result[0]?.summary_text || "No se recibió resumen";
  } catch (err) {
    console.error("Error en summarizeText:", err.message);
    throw err;
  }
}