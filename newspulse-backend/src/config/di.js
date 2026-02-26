/**
 * Contenedor de Inyección de Dependencias (DI)
 * Aca se instancian todos los repos, servicios y controladores
 */

import News from "../models/News.js";
import User from "../models/User.js";

// Repositorios
import { createNewsRepository } from "../repositories/newsRepository.js";
import { createUserRepository } from "../repositories/userRepository.js";

// Servicios
import { createNewsService } from "../services/newsService.js";
import { createAuthService } from "../services/authService.js";
import { createUserService } from "../services/userService.js";
import { createNewsClassifierService } from "../services/newsClassifier.js";
import { createNewsApiService } from "../services/newsApiService.js";
import { createNewsSummarizerService } from "../services/newsSummarizer.js";
import { createAiService } from "../services/aiService.js";

// Controladores
import { createNewsController } from "../controllers/newsController.js";
import { createAuthController } from "../controllers/authController.js";
import { createRecommendationController } from "../controllers/recommendationController.js";
import { createSearchController } from "../controllers/searchController.js";
import { createSummaryController } from "../controllers/summaryController.js";

// ========== REPOSITORIOS ==========
const newsRepo = createNewsRepository(News);
const userRepo = createUserRepository(User);

// ========== SERVICIOS ==========
const aiService = createAiService();
const classifierService = createNewsClassifierService();

const newsService = createNewsService(newsRepo);
const userService = createUserService(userRepo, newsRepo);
const authService = createAuthService(userRepo);
const summarizerService = createNewsSummarizerService(newsRepo, aiService);
const newsApiService = createNewsApiService(newsRepo, classifierService);

// ========== CONTROLADORES ==========
export const newsController = createNewsController(
  newsService,
  newsApiService,
  summarizerService
);

export const authController = createAuthController(authService);

export const recommendationController = createRecommendationController(
  userService,
  newsService
);

export const searchController = createSearchController(newsService);

export const summaryController = createSummaryController(summarizerService);

// Exportar también servicios si se necesitan en otros lados
export { newsService, authService, userService, aiService, classifierService };
