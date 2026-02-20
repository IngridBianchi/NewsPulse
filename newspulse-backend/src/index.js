import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";

import newsRoutes from "./routes/news.js";
import authRoutes from "./routes/auth.js";
import summaryRoutes from "./routes/summary.js";

import errorHandler from "./middlewares/errorHandler.js"; 
import logger from "./config/logger.js";


dotenv.config();
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