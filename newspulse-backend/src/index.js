const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const newsRoutes = require('./routes/news');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/news', newsRoutes);

app.get('/', (req, res) => {
  res.send('NewsPulse API funcionando 🚀');
});

app.use('/api/auth', authRoutes);

// Middleware de errores (último)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));