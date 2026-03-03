import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import newsRoutes from "./routes/news.js";
import authRoutes from "./routes/auth.js";
import summaryRoutes from "./routes/summary.js";
import userRoutes from "./routes/user.js";
import errorHandler from "./middlewares/errorHandler.js"; 
import logger from "./config/logger.js";

// Cargar variables de entorno al inicio
dotenv.config();

// Validar variables de entorno críticas
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];
REQUIRED_ENV_VARS.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Variable de entorno ${envVar} no está definida`);
    process.exit(1);
  }
});

logger.info("✅ Variables de entorno validadas");

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use('/api/news', newsRoutes);
app.use('/summarize', summaryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // endpoints para historial y recomendaciones

app.get('/', (req, res) => {
  res.send('NewsPulse API funcionando 🚀');
});

// Middleware global de errores → log con Winston
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.url}`);
  errorHandler(err, req, res, next);
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => logger.info(`Servidor corriendo en puerto ${PORT}`));
}

export default app;