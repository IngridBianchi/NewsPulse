import { summarizeText } from "../services/aiService.js";

export async function summarizeHandler(req, res) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Falta el campo 'text'" });
    }

    const summary = await summarizeText(text);
    res.json({ success: true, summary });
  } catch (err) {
    console.error("Error en summarizeHandler:", err.message);
    res.status(500).json({
      success: false,
      message: "Error interno al generar resumen",
      error: err.message,
    });
  }
}