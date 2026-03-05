# NewsPulse 📰

NewsPulse es una plataforma moderna de agregación de noticias con inteligencia artificial, que ofrece recomendaciones personalizadas, búsqueda avanzada y resúmenes automáticos de artículos.

## 🎯 Características Principales

- **🔍 Búsqueda Inteligente**: Búsqueda en tiempo real desde el backend con resultados contextuales
- **🤖 Recomendaciones IA**: Motor de recomendaciones basado en el historial de lectura del usuario
- **📊 Panel de Administración**: Interfaz completa para crear, editar y eliminar artículos
- **🏷️ Filtrado por Categorías**: Organiza noticias por temas de interés
- **✍️ Resúmenes Automáticos**: Generación de resúmenes de artículos con IA
- **👤 Perfiles de Usuario**: Gestión de preferencias y historial de lectura
- **🔐 Autenticación Segura**: Sistema JWT con tokens almacenados de forma segura
- **📱 Diseño Responsivo**: Interfaz moderna con Tailwind CSS

## 🏗️ Estructura del Proyecto

```
NewsPulse/
├── newspulse-backend/        # API REST con Express.js
│   ├── src/
│   │   ├── config/           # Configuración (DB, DI, Logger, Env)
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── models/           # Esquemas de Mongoose
│   │   ├── repositories/     # Capa de acceso a datos
│   │   ├── services/         # Lógica de negocio
│   │   ├── middlewares/      # Middleware (auth, errors, roles)
│   │   └── routes/           # Definición de rutas
│   ├── test/                 # Tests con Jest
│   └── scripts/              # Scripts utilities (seedNews.js)
│
└── newspulse-frontend/       # React + TypeScript con Vite
    ├── src/
    │   ├── app/
    │   │   ├── components/   # Componentes React
    │   │   ├── lib/          # Utilidades y API client
    │   │   └── routes.ts     # Rutas de la aplicación
    │   ├── assets/           # Recursos estáticos
    │   └── styles/           # Estilos globales
    └── guidelines/           # Documentación de diseño
```

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose ODM
- **Autenticación**: JWT (jsonwebtoken)
- **Logging**: Winston
- **Testing**: Jest
- **Validación**: Zod

### Frontend
- **Framework**: React 18+ con TypeScript
- **Build Tool**: Vite
- **Ruteo**: React Router v7
- **Estilos**: Tailwind CSS + PostCSS
- **Componentes UI**: Shadcn UI
- **Iconos**: Lucide React
- **Animaciones**: Motion React
- **HTTP Client**: Fetch API

## 📋 Requisitos Previos

- Node.js 16.x o superior
- npm o yarn
- MongoDB (local o MongoDB Atlas)
- Una clave API de NewsAPI (para obtener artículos)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd NewsPulse
```

### 2. Configurar Backend

```bash
cd newspulse-backend

# Instalar dependencias
npm install

# Crear archivo .env en la raíz del backend
cat > .env << EOF
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=tu_secret_jwt_muy_seguro
PORT=5000
NEWS_API_KEY=tu_api_key_de_newsapi
LOG_LEVEL=info
EOF

# Ejecutar servidor de desarrollo
npm run dev
```

### 3. Configurar Frontend

```bash
cd newspulse-frontend

# Instalar dependencias
npm install

# El frontend automáticamente conectará al backend en http://localhost:5000

# Ejecutar servidor de desarrollo
npm run dev
```

## 🔗 API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Noticias (Artículos)
- `GET /api/news` - Obtener todas las noticias con paginación
- `GET /api/news/search?q=término` - Buscar noticias
- `GET /api/news/category/:name` - Obtener noticias por categoría
- `GET /api/news/:id` - Obtener detalle de una noticia
- `POST /api/news` - Crear nueva noticia (solo admin)
- `PUT /api/news/:id` - Actualizar noticia (solo admin)
- `DELETE /api/news/:id` - Eliminar noticia (solo admin)

### Recomendaciones
- `GET /api/recommendations` - Obtener recomendaciones personalizadas

### Resúmenes
- `POST /api/summary` - Generar resumen de un artículo

### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario
- `POST /api/users/history` - Registrar lectura de artículo

### Noticias Globales
- `GET /api/news/global/trending` - Obtener noticias trending
- `POST /api/news/global/refresh` - Refrescar noticias desde NewsAPI

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)**:

1. El usuario se registra o inicia sesión
2. El servidor retorna un token JWT
3. El cliente almacena el token en localStorage
4. En cada solicitud autenticada, envía el token en el header:
   ```
   Authorization: Bearer <tu_token_jwt>
   ```

## 👥 Roles y Permisos

- **Usuario Regular**: Puede leer artículos, búscar, acceder a recomendaciones
- **Usuario Admin**: Acceso completo a panel de administración (CRUD de artículos)

## 📊 Modelos de Datos

### Usuario
```typescript
{
  _id: ObjectId
  email: string (único)
  password: string (hash bcrypt)
  name: string
  role: "user" | "admin"
  categoryPreferences: Map<string, number>
  readingHistory: Array<{ articleId, readAt }>
  createdAt: Date
}
```

### Artículo
```typescript
{
  _id: ObjectId
  title: string
  content: string
  summary: string
  url: string (único)
  urlToImage: string
  publishedAt: Date
  sourceName: string
  category: string
  status: "PUBLICADO" | "BORRADOR"
  createdAt: Date
}
```

## 👨‍💻 Desarrollo

### Estructura de Carpetas Explicada

#### Backend (`newspulse-backend/src`)
- **config/**: Configuración centralizada (DB, inyección de dependencias, logger)
- **controllers/**: Manejan solicitudes HTTP y coordinan servicios
- **services/**: Contienen la lógica de negocio principal
- **repositories/**: Acceso a datos con MongoDB
- **models/**: Esquemas Mongoose para BD
- **middlewares/**: Autenticación, manejo de errores, validación de roles

#### Frontend (`newspulse-frontend/src`)
- **components/**: Componentes React reutilizables
  - `Layout.tsx`: Componente raíz con navegación
  - `Feed.tsx`: Listado de noticias con búsqueda y filtros
  - `AdminPanel.tsx`: Panel de administración
  - `Profile.tsx`: Perfil de usuario
  - `ArticleDetail.tsx`: Detalle de artículo
- **lib/api.ts**: Cliente HTTP centralizado
- **lib/storage.ts**: Manejo de localStorage
- **styles/**: Estilos globales y tema

## 🧪 Testing

### Backend
```bash
cd newspulse-backend
npm test
```

Los tests cubren:
- Autenticación y autorización
- CRUD de artículos
- Búsqueda y filtrado

## 🐛 Solución de Problemas

### La API retorna 404
- Verifica que el servidor backend esté corriendo: `npm run dev` en `newspulse-backend`
- Asegúrate de que MongoDB está conectado

### Errores de autenticación
- Limpia localStorage y vuelve a iniciar sesión
- Verifica que el JWT_SECRET en `.env` es el correcto

### Las recomendaciones no aparecen
- Asegúrate de haber leído al menos 2-3 artículos
- Verifica los logs del servidor para errores

### Búsqueda no retorna resultados
- Los artículos deben tener el índice de texto creado en MongoDB
- Ejecuta `npm run seed` para cargar datos de ejemplo con índices

## 📚 Scripts Disponibles

### Backend
```bash
npm run dev          # Iniciar servidor en modo desarrollo
npm run build        # Compilar TypeScript (si aplica)
npm test             # Ejecutar tests
npm run seed         # Poblar BD con noticias de ejemplo
```

### Frontend
```bash
npm run dev          # Iniciar servidor de desarrollo (puerto 5173)
npm run build        # Compilar para producción
npm run preview      # Ver build de producción localmente
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

## 🌐 Variables de Entorno

### Backend (.env)
```
NODE_ENV=development
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/newspulse
JWT_SECRET=tu_secret_super_seguro_aqui
PORT=5000
NEWS_API_KEY=tu_api_key_de_newsapi
LOG_LEVEL=info
```

### Frontend (Automático)
El frontend automáticamente detecta el backend en `http://localhost:5000`

## 🎨 Diseño y UX

- Interfaz moderna y limpia con Tailwind CSS
- Componentes de Shadcn UI para consistencia
- Animaciones suaves con Motion React
- Responsivo en todos los dispositivos
- Modo oscuro compatible

## 🤝 Flujo de Uso Típico

1. **Registro/Login**: Usuario crea cuenta o inicia sesión
2. **Explorar Noticias**: Ve el feed principal con noticias trending
3. **Buscar**: Utiliza barra de búsqueda para encontrar artículos específicos
4. **Filtrar**: Selecciona categorías para refinar resultados
5. **Leer**: Abre detalle del artículo, se registra su lectura
6. **Recomendaciones**: El sistema aprende preferencias y sugiere artículos
7. **Admin** (si aplica): Puede crear, editar o eliminar artículos

## 📝 Cambios Recientes

### v1.0
- ✅ Sistema de búsqueda backend integrado
- ✅ Panel de administración con CRUD
- ✅ Motor de recomendaciones IA
- ✅ Filtrado por categorías
- ✅ Autenticación JWT
- ✅ Historial de lectura
- ✅ Resúmenes automáticos

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📞 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

---

**Última actualización**: Marzo 2026  
**Versión**: 1.0.0
