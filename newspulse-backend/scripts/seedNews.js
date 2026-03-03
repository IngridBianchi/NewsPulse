import dotenv from "dotenv";
import { connect } from "mongoose";
import { createNewsApiService } from "../src/services/newsApiService.js";
import { createNewsRepository } from "../src/repositories/newsRepository.js";
import News from "../src/models/News.js";
import { createNewsClassifierService } from "../src/services/newsClassifier.js";

dotenv.config();

async function seed() {
  await connect(process.env.MONGO_URI);

  const newsRepo = createNewsRepository(News);
  const classifierService = createNewsClassifierService();
  const newsApiService = createNewsApiService(newsRepo, classifierService);

  // 1. Limpiar colección
  await newsRepo.clearAll();
  console.log("Base de datos limpia.");

  // 2. Traer y guardar noticias de la API
  const articles = await newsApiService.fetchAndSaveGlobalNews();

  console.log(`Insertadas ${articles.length} noticias desde la API.`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Error en seed:", err);
  process.exit(1);
});

const count = await News.countDocuments();
console.log(`Noticias en la base: ${count}`);