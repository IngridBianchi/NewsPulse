import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  url: { type: String, unique: true },
  urlToImage: String,
  publishedAt: Date,
  sourceName: String,
  category: String,
});

// Índice de texto para búsquedas básicas
newsSchema.index({ title: "text", summary: "text", content: "text" });

const News = mongoose.model("News", newsSchema);
export default News;