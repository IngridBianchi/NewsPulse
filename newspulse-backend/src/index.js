import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import newsRoutes from "./routes/news.js";
import authRoutes from "./routes/auth.js";
import summaryRoutes from "./routes/summary.js";

import errorHandler from "./middlewares/errorHandler.js"; // 👈 import correcto
import auth from "./middlewares/auth.js"; // 👈 import correcto


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/summarize', summaryRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('NewsPulse API funcionando 🚀');
});

// Middleware de errores (último)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));