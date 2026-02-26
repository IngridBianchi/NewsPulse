# NewsPulse Backend - Code Analysis

Este documento describe la estructura, el flujo de trabajo y las recomendaciones de mejora del proyecto **NewsPulse** (backend). El análisis cubre cada carpeta/archivo relevante y su interacción dentro de la aplicación.

---

## 📁 Estructura general

```
newspulse-backend/
├── src/
│   ├── config/           # configuración de infra
│   │   ├── db.js         # conexión a MongoDB
│   │   └── logger.js     # Winston logger
│   │
│   ├── controllers/      # lógica de presentación (HTTP)
│   │   ├── authController.js
│   │   ├── newsController.js
│   │   ├── recommendationController.js
│   │   ├── searchController.js
│   │   └── summaryController.js
│   │
│   ├── middlewares/      # validaciones y permisos
│   │   ├── auth.js
│   │   ├── role.js
│   │   └── errorHandler.js
│   │
│   ├── models/           # esquemas Mongoose
│   │   ├── User.js
│   │   └── News.js
│   │
│   ├── routes/           # definición de endpoints
│   │   ├── auth.js
│   │   ├── news.js
│   │   └── summary.js
│   │
│   ├── services/         # lógica de negocio / integración con terceros
│   │   ├── aiService.js
│   │   ├── authService.js
│   │   ├── newsApiService.js
│   │   ├── newsClassifier.js
│   │   ├── newsService.js
│   │   └── newsSummarizer.js
│   │
│   └── index.js          # punto de entrada Express
│
├── test/                 # pruebas automatizadas (Jest + Supertest)
│   ├── auth.test.js
│   └── news.test.js
├── .env                  # variables de entorno
├── package.json
└── jest.conf.js
```

---

## 🔄 Flujo de trabajo típico

1. **Solicitud HTTP** entra en `src/index.js`, donde Express está configurado con CORS, cuerpos JSON/URL-encoded, Morgan y Winston.
2. La URL se enruta a uno de los routers (`newsRoutes`, `authRoutes`, `summaryRoutes`).
3. En el router se aplican:
   - Middlewares de autenticación (`auth`) y autorización (`authorizeRoles`) según corresponda.
   - Reglas de validación express-validator.
4. El controlador asociado maneja la petición: extrae parámetros, valida, utiliza servicios y maneja respuestas/errores.
5. Los **servicios** encapsulan la lógica de negocio y/o llamadas externas (NewsAPI, Hugging Face, JWT, encriptación, etc.) y acceden a los modelos.
6. Los **modelos Mongoose** interactúan con MongoDB para operaciones CRUD.
7. Errores fluyen hacia el middleware global `errorHandler` que formatea la respuesta JSON.
8. Las pruebas (`test/`) usan Supertest para simular peticiones y validar comportamiento.

Este diseño sigue una arquitectura tipo **MVC ligera** (modelos, controladores, vistas/routers) con una capa intermedia de servicios.

---

## 🧠 Revisión por archivo/capítulo

### Configuración
- `db.js`: conexión sencilla; usa `process.exit` en caso de error.
- `logger.js`: configuración Winston con consola y archivos; buen uso de `timestamp`/JSON.

### Modelos
- `User`: almacena contraseñas hashed mediante hook `pre('save')`, rol con enum, historial de lectura y preferencias de categoría (Map).
- `News`: esquema básico de noticias con campos extendidos y embedding (arreglo numérico) para búsquedas semánticas.

### Servicios
- `authService`: registro/login; maneja hashing y JWT. (excepción creada manualmente, sin helpers de error). 
- `newsService`: CRUD y listados con paginación; mezcla lógica de query en servicio.
- `newsApiService`: consulta NewsAPI y actualiza/crea artículos; clasifica usando `newsClassifier`.
- `newsClassifier`: llama a modelo de HF para categorizar texto con fallback.
- `aiService`: resumen de texto con Hugging Face y plan de fallback.
- `newsSummarizer`: método especializado que actualiza un documento con el resumen.

> **Nota:** varios servicios importan `dotenv` y configuran variables; esto podría centralizarse.

### Controladores
- `authController`: obtiene validación, llama a `authService`.
- `newsController`: bastante extenso; realiza validaciones, crea/lee/actualiza/elimina, además de endpoints especiales (`getGlobalNews`, `summarizeOneNews`, `getNewsByCategory`).
- `searchController`: intenta hacer búsqueda semántica, pero usa variable `queryEmbedding` sin calcularla → bug.
- `recommendationController`: usa datos de usuario para recomendar.
- `summaryController`: simple proxy a `aiService`.

### Middlewares
- `auth`: decodifica JWT y adiciona `req.user`.
- `role`: comprueba roles permitidos.
- `errorHandler`: formatea la respuesta de error.

### Rutas
- `news.js`: agrupa endpoints relacionados con noticias; incluye validaciones inline.
- `summary.js` y `auth.js`: rutas específicas.

### Pruebas
- Cubren registro/login y operaciones CRUD básicas de noticias con roles y validaciones.

---

## ✅ Hallazgos y recomendaciones de optimización

### 📦 Modularización y separación de responsabilidades
- **Extraer validaciones a módulos independientes.** Actualmente las reglas `body(...)` están duplicadas en `news.js`; crear un archivo `validators/newsValidator.js` ayuda a mantenerlos.
- **`newsController` está sobredimensionado.** Dividir algunos métodos (p.ej. `getGlobalNews`, `summarizeOneNews`, `getNewsByCategory`) en controladores dedicados o promover a servicios que devuelvan datos, manteniendo el controlador muy fino (Single Responsibility).
- **Independentizar la lógica de clasificación y actualizaciones en `newsApiService`.** Actualmente guarda primero con `category: null` y luego vuelve a actualizar; podría hacerse en una sola pasada y extraer la obtención de articles a otro módulo reutilizable.
- **Crear un helper de errores** para uniformar creación de `Error` con status y mensajes (p.ej. `createError(status, message)` o usar `http-errors` package). Esto facilita el mantenimiento y adhere a DRY.
- **Centralizar la carga de configuración.** `dotenv.config()` se repite en varios servicios (newsClassifier, newsApiService). Dejarlo en `index.js` y usar un módulo `config.js` que exporte variables tipadas reduce fricción.

### 🧩 SOLID y buenas prácticas
- **S (Single Responsibility):** cada clase/módulo debe tener una única razón para cambiar. Controllers deben delegar al servicio en lugar de manipular modelos directamente (especialmente el flujo de `updateNews` y `createNews`).
- **O (Open/Closed):** servicios como `aiService` o `newsClassifier` podrían aceptar un cliente HF externo inyectado, permitiendo mocks o reemplazo sin modificar el código.
- **L (Liskov):** no se observa violación directa, pero si se inyectan dependencias, se debe respetar interfaces.
- **I (Interface Segregation):** las funciones exportadas por un servicio deben ser pequeñas y específicas a su propósito; separar `summarizeText` de `aiService` en un módulo de `hfClient` podría ayudar.
- **D (Dependency Inversion):** no dependas directamente de `News` o `User` dentro de servicios; exporta interfaces o utiliza repositorios para facilitar pruebas y desacoplar (ej. `newsRepository.findById`).

### 🛠 Código y estilo
- Usar **async/await** consistentemente con try/catch; algunos métodos usan Promises (`.then`) o retornos directos.
- El middleware de errors loguea con `console.error`; podría usar el `logger` configurado.
- Los imports en varios archivos usan rutas relativas largas (`../services/...`). Podría activarse `module-alias` o `NODE_PATH` para simplificar.
- Variables de entorno nunca se validan; agregar esquema de validación (Joi, Yup) para requerir `MONGO_URI`, `JWT_SECRET`, etc.
- Añadir índices a colecciones (ej. `News.index({ url: 1 }, { unique: true })`) y quizá a campos usados en queries frecuentes (`category`, `publishedAt`).
- Evitar duplicar `dotenv.config()` en cada servicio: una sola vez al inicio.
- En `newsApiService`, la lógica de dos bucles separados podría unificarse y usar `bulkWrite` en Mongo para eficiencia.

### 🧪 Pruebas
- Añadir tests para controladores faltantes (`recommendation`, `search`, `summary`).
- Crear mocks para servicios externos (Hugging Face, NewsAPI) usando herramientas como `nock`.
- Agregar pruebas unitarias a servicios sin acceso HTTP.
- Actuar sobre base de datos in-memory (mongo-memory-server) para aislar tests.

### 🪲 Correcciones de bugs
- **`searchController.semanticSearch`:** `queryEmbedding` no está definido. Debería generarse usando un servicio de embeddings (p.ej. `aiService.embedText`) o recurrir a la base de datos.
- `newsApiService` no controla excepciones de axios, lo que puede romper la tarea de recolectar noticias.
- Si `fetchAndSaveGlobalNews` se ejecuta muy seguido, causa múltiples llamadas redundantes; podría implementarse un locking o un cron job.

### 🧰 Mejoras sugeridas
- Implementar **inyección de dependencias** con un contenedor simple (Awilix, Inversify) para facilitar mocks y desacoplamiento.
- Usar **TypeScript** para tipar esquemas, servicios y evitar errores runtime.
- Convertir `News` y `User` en **repositories** o usar patrón DAO para encapsular consultas.
- Extraer **comunicación con Hugging Face** a un cliente reutilizable (`hfClient.js`) con soporte para múltiples modelos.
- Añadir caching (Redis) para endpoints intensivos (news listing, recommendations).
- Mejorar seguridad: sanitizar entradas, limitar tamaño del cuerpo, usar helmet, rate-limiting.

### 🧹 Limpieza y mantenimiento
- Remover código comentado (p. ej. `console.log(...)`) y console.logs innecesarios una vez que la feature esté en producción.
- Consolidar dependencias en `package.json` (eliminar imports no usados como `dotenv` en cada módulo).

---

## ✔️ Resumen

El backend de NewsPulse está bien encaminado: estructura clara, separación básica de capas y pruebas de integración. Hay oportunidades de
optimización en modularización, aplicación de principios SOLID, manejo de errores y escalabilidad. Implementando las recomendaciones anteriores
se logrará una base más mantenible, testeable y preparada para crecer (microservicios, carga masiva, integración con más modelos de IA, etc.).

> **Próximos pasos sugeridos:**
> 1. Corregir bugs de búsqueda semántica y validar variables de entorno.
> 2. Refactorizar controllers/servicios según SRP y Dependency Injection.
> 3. Añadir validaciones/índices y ampliar la suite de tests.
> 4. Considerar migrar a TypeScript y/o incorporar caché si la API crece.

¡Listo para continuar construyendo! 🚀