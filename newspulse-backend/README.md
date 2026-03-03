# NewsPulse Backend 🚀

API REST desarrollada con Express.js y MongoDB que potencia la plataforma de agregación de noticias NewsPulse.

## 📋 Contenido

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura](#estructura)
- [API Endpoints](#api-endpoints)
- [Autenticación](#autenticación)
- [Base de Datos](#base-de-datos)
- [Servicios](#servicios)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Características

- ✅ API RESTful completa
- ✅ Autenticación JWT
- ✅ Control de roles (admin/usuario)
- ✅ Búsqueda full-text en MongoDB
- ✅ Recomendaciones personalizadas basadas en IA
- ✅ Resúmenes automáticos de artículos
- ✅ Integración con NewsAPI
- ✅ Logging estructurado con Winston
- ✅ Validación de entrada con Zod
- ✅ Dependency Injection (patrón factory)
- ✅ Tests con Jest
- ✅ Manejo robusto de errores

## 📦 Requisitos

- Node.js 16.x o superior
- npm o yarn
- MongoDB 4.0+ (local o MongoDB Atlas)
- API Key de [NewsAPI.org](https://newsapi.org)

## 🔧 Instalación

### 1. Instalar Dependencias

```bash
cd newspulse-backend
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del backend:

```env
# Entorno
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/newspulse

# Autenticación
JWT_SECRET=tu_secret_jwt_super_seguro_cambiar_en_produccion
JWT_EXPIRY=7d

# Servidor
PORT=5000

# NewsAPI
NEWS_API_KEY=tu_api_key_de_newsapi

# Logging
LOG_LEVEL=info
```

### 3. Iniciar Servidor

```bash
# Desarrollo con hot-reload
npm run dev

# Producción
npm start

# Con logs detallados
DEBUG=* npm run dev
```

El servidor estará disponible en `http://localhost:5000`

## 📁 Estructura del Proyecto

```
src/
├── config/
│   ├── db.js              # Conexión a MongoDB
│   ├── di.js              # Inyección de dependencias
│   ├── logger.js          # Configuración de Winston
│   └── validateEnv.js     # Validación de variables de entorno
│
├── controllers/           # Layer de entrada HTTP
│   ├── authController.js
│   ├── newsController.js
│   ├── recommendationController.js
│   ├── searchController.js
│   └── summaryController.js
│
├── services/              # Lógica de negocio
│   ├── authService.js
│   ├── newsService.js
│   ├── userService.js
│   ├── newsApiService.js
│   ├── newsClassifier.js
│   ├── newsSummarizer.js
│   └── aiService.js
│
├── repositories/          # Acceso a datos
│   ├── newsRepository.js
│   └── userRepository.js
│
├── models/                # Esquemas Mongoose
│   ├── User.js
│   └── News.js
│
├── middlewares/           # Validaciones y verificaciones
│   ├── auth.js            # Verificar JWT
│   ├── errorHandler.js    # Manejo centralizado de errores
│   └── role.js            # Verificar permisos
│
├── routes/                # Definición de rutas
│   ├── auth.js
│   ├── news.js
│   └── summary.js
│
└── index.js               # Punto de entrada
```

## 🔌 API Endpoints

### Autenticación

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Artículos (News)

```
GET    /api/news                    # Listar con paginación
GET    /api/news/search?q=término   # Búsqueda full-text
GET    /api/news/category/:name     # Filtrar por categoría
GET    /api/news/:id                # Obtener uno
POST   /api/news                    # Crear (admin)
PUT    /api/news/:id                # Actualizar (admin)
DELETE /api/news/:id                # Eliminar (admin)
```

### Noticias Globales

```
GET  /api/news/global/trending      # Trending news
POST /api/news/global/refresh       # Refrescar desde NewsAPI
```

### Recomendaciones

```
GET /api/recommendations            # Obtener recomendaciones personalizadas
```

### Resúmenes

```
POST /api/summary                   # Generar resumen de artículo
```

### Usuarios

```
GET  /api/users/profile             # Perfil del usuario autenticado
POST /api/users/history             # Registrar artículo leído
```

## 🔐 Autenticación

### Sistema JWT

1. **Registro**: El usuario envía email, password, name
   ```bash
   POST /api/auth/register
   Content-Type: application/json
   
   {
     "email": "usuario@ejemplo.com",
     "password": "contraseña123",
     "name": "Juan Pérez"
   }
   ```

2. **Login**: El usuario se autentica
   ```bash
   POST /api/auth/login
   Content-Type: application/json
   
   {
     "email": "usuario@ejemplo.com",
     "password": "contraseña123"
   }
   ```

3. **Respuesta**: Backend retorna token JWT
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIs...",
       "user": {
         "_id": "123...",
         "email": "usuario@ejemplo.com",
         "name": "Juan Pérez",
         "role": "user"
       }
     }
   }
   ```

4. **Uso del Token**: Cliente incluye en header de solicitudes protegidas
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

### Middleware de Autenticación

```javascript
// Proteger rutas
router.get('/api/users/profile', authMiddleware, getUserProfile);

// Con verificación de rol
router.post('/api/news', authMiddleware, requireRole('admin'), createNews);
```

## 💾 Base de Datos

### Esquema de Usuario

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (bcrypt hash),
  name: String,
  role: String (enum: ['user', 'admin']),
  categoryPreferences: Map<String, Number>,
  readingHistory: [{
    articleId: ObjectId,
    readAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Esquema de Artículo

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  summary: String,
  url: String (unique),
  urlToImage: String,
  publishedAt: Date,
  sourceName: String,
  category: String,
  status: String (enum: ['PUBLICADO', 'BORRADOR']),
  createdAt: Date,
  updatedAt: Date
}
```

**Índices automáticos**:
- Texto completo: título, contenido, resumen
- Categoría: para filtrados rápidos
- URL: garantiza unicidad

## 🤖 Servicios Principales

### newsService
Gestión de artículos y CRUD:
- `createNews(data)` - Crear artículo
- `updateNews(id, data)` - Actualizar
- `deleteNews(id)` - Eliminar
- `getNewsByCategory(category)` - Filtrar por categoría
- `getNewsDetail(id)` - Obtener detalle

### userService
Lógica de usuarios:
- `registerUser(email, password, name)` - Registrar
- `authenticate(email, password)` - Login
- `getRecommendations(userId)` - Generar recomendaciones
- `updateReadingHistory(userId, articleId)` - Registrar lectura
- `updateCategoryPreference(userId, category)` - Actualizar preferencias

### newsApiService
Integración con API externa:
- `fetchLatestNews(query, language)` - Obtener noticias trending
- `refreshGlobalNews()` - Actualizar desde NewsAPI

### newsSummarizer
Generación de resúmenes:
- `summarize(text, maxLength)` - Crear resumen automático

### newsClassifier
Clasificación de artículos:
- `classifyCategory(title, content)` - Asignar categoría

### authService
Manejo de autenticación:
- `hashPassword(password)` - Hash seguro
- `comparePassword(plain, hash)` - Verificar contraseña
- `generateToken(userId)` - Crear JWT
- `verifyToken(token)` - Validar JWT

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Con cobertura
npm test -- --coverage

# Watch mode
npm test -- --watch

# Test específico
npm test auth.test.js
```

### Estructura de Tests

```
test/
├── auth.test.js          # Tests de autenticación
├── news.test.js          # Tests de artículos
└── recommendations.test.js
```

## 🚀 Deployment

### En Heroku

```bash
# Login
heroku login

# Crear app
heroku create newspulse-api

# Setear variables de entorno
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
heroku config:set NEWS_API_KEY=...

# Deploy
git push heroku main
```

### En AWS

1. Usar Elastic Beanstalk o EC2
2. Configurar MongoDB Atlas o RDS
3. Setear variables de entorno en Environment Variables
4. Usar PM2 para mantener proceso corriendo

### Variables de Entorno Recomendadas (Producción)

```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://prod_user:strong_password@prod-cluster.mongodb.net/newspulse
JWT_SECRET=super_secret_string_muy_largo_y_seguro_aqui
JWT_EXPIRY=7d
NEWS_API_KEY=tu_api_key_produccion
LOG_LEVEL=warn
```

## 🔍 Monitoreo y Logs

### Winston Logger

Los logs se guardan en `/logs`:
- `combined.log` - Todos los logs
- `error.log` - Solo errores
- Consola - Output en tiempo real

```javascript
logger.info('Usuario registrado', { email });
logger.error('Error en BD', { error });
logger.warn('Rate limit alcanzado', { ip });
logger.debug('SQL query', { query });
```

## 🛠️ Problemas Comunes

### "MONGODB_URI not found"
Verifica que el archivo `.env` existe y tiene `MONGODB_URI` definido

### "JWT verification failed"
El token puede haber expirado. El cliente debe solicitar un nuevo login

### "Connection refused en MongoDB"
Verifica:
- MongoDB está corriendo
- Username/password correctos
- IP allowlist en MongoDB Atlas

### Búsqueda no retorna resultados
Asegúrate que los índices de texto estén creados:
```javascript
db.news.createIndex({ title: "text", content: "text", summary: "text" })
```

## 📝 Notas de Desarrollo

### Patrón de Inyección de Dependencias

```javascript
// di.js
const setupDI = () => {
  const userRepo = UserRepository();
  const userService = UserService(userRepo);
  const userController = UserController(userService);
  return { userController, userService, userRepo };
};
```

### Manejo de Errores Centralizado

```javascript
// errorHandler.js
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno';
  res.status(status).json({ success: false, message });
});
```

### Validación con Zod

```javascript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

## 📚 Referencias Útiles

- [Express.js Docs](https://expressjs.com)
- [Mongoose Docs](https://mongoosejs.com)
- [JWT.io](https://jwt.io)
- [NewsAPI Docs](https://newsapi.org/docs)

---

**Última actualización**: Marzo 2026  
**Versión**: 1.0.0
