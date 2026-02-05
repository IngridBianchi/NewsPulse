const { HfInference } = require('@huggingface/inference');

// Inicializamos la librería con tu token
const hf = new HfInference(process.env.HF_API_KEY);

async function generateSummary(text) {
  try {
    // Usamos el método de summarization
    const result = await hf.summarization({
      model: "google/pegasus-xsum", // puedes probar también bart-large-cnn
      inputs: text
    });

    console.log("Respuesta de Hugging Face:", result);

    // La librería devuelve un objeto con summary_text
    if (result?.summary_text) {
      return result.summary_text;
    }

    return "No se pudo generar el resumen (respuesta vacía).";
  } catch (error) {
    console.error("Error en generateSummary:", error.message);
    return "No se pudo generar el resumen (fallo en Hugging Face).";
  }
}

module.exports = { generateSummary };