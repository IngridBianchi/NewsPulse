
# NewsPulse Frontend 💻

Interfaz de usuario moderna desarrollada con React + TypeScript y Vite, que ofrece una experiencia fluida de lectura de noticias personalizadas.

## 📋 Contenido

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura](#estructura)
- [Componentes](#componentes)
- [API Integration](#api-integration)
- [Desarrollo](#desarrollo)
- [Build y Deploy](#build-y-deploy)

## ✨ Características

- ✅ Interfaz moderna y responsiva
- ✅ Búsqueda en tiempo real
- ✅ Filtrado por categorías
- ✅ Recomendaciones personalizadas
- ✅ Autenticación JWT
- ✅ Panel de administración
- ✅ Perfil de usuario
- ✅ Historial de lectura
- ✅ Resúmenes automáticos
- ✅ Modo oscuro
- ✅ Animaciones suaves
- ✅ TypeScript para seguridad de tipos

## 📦 Requisitos

- Node.js 16.x o superior
- npm o yarn
- Backend API ejecutándose en `http://localhost:5000`

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── App.tsx              # Componente raíz
│   ├── routes.ts            # Definición de rutas
│   │
│   ├── components/
│   │   ├── Layout.tsx       # Componente raíz con navegación
│   │   ├── Feed.tsx         # Feed principal de noticias
│   │   ├── AdminPanel.tsx   # Panel de administración
│   │   ├── Profile.tsx      # Perfil de usuario
│   │   ├── ArticleDetail.tsx# Detalle de artículo
│   │   │
│   │   └── ui/              # Componentes reutilizables (30+)
│   │
│   └── lib/
│       ├── api.ts           # Cliente HTTP centralizado
│       ├── storage.ts       # Manejo de localStorage
│       └── data.ts          # Utilidades de datos
│
├── assets/                  # Recursos estáticos
├── styles/                  # Estilos (Tailwind, tema, etc)
└── main.tsx                 # Punto de entrada
```

## 🧩 Componentes Principales

### Layout.tsx
- Header con logo y navegación
- Barra de búsqueda
- Sidebar de categorías
- Gestión de estado

### Feed.tsx
- Listado de artículos con infinite scroll
- Búsqueda en tiempo real
- Filtrado por categorías
- Sección de trending
- Resultados de búsqueda

### AdminPanel.tsx
- Crear, editar, eliminar artículos
- Cambiar estado (PUBLICADO/BORRADOR)
- Cargar noticias desde NewsAPI
- Tabla de administración

### Profile.tsx
- Información de usuario
- Recomendaciones personalizadas
- Historial de lectura
- Logout

### ArticleDetail.tsx
- Contenido completo del artículo
- Resumen automático
- Información de fuente
- Metadatos (autor, fecha)

## 🔌 API Integration

### Cliente HTTP (`lib/api.ts`)

Funciones disponibles:
- Autenticación: `register()`, `login()`, `logout()`
- Artículos: `fetchArticles()`, `searchNews()`, `fetchNewsByCategory()`, `getNewsDetail()`, `createNews()`, `updateNews()`, `deleteNews()`
- Globales: `getGlobalNews()`, `refreshGlobalNews()`
- Recomendaciones: `getRecommendations()`
- Usuario: `getUserProfile()`, `recordReadingHistory()`

## 🎨 Diseño y Estilos

- **Tailwind CSS**: Framework de utilidades para estilos
- **Shadcn UI**: Componentes pre-construidos accesibles
- **Motion React**: Animaciones suaves
- **Modo oscuro**: Soportado automáticamente

## 👨‍💻 Desarrollo

### Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run type-check   # Verificar tipos TypeScript
```

### Convenciones

- PascalCase para componentes: `MyComponent.tsx`
- camelCase para funciones: `myFunction`
- TypeScript con tipos strictos

## 🏗️ Build y Deploy

### Build
```bash
npm run build
```

### Deploy en Vercel
```bash
vercel
```

### Deploy en Netlify
```bash
netlify deploy --prod --dir=dist
```

## 🐛 Troubleshooting

### El frontend no conecta al backend
- Verifica que backend está en puerto 5000
- Comprueba que MongoDB está conectado

### Error de autenticación
- Limpia localStorage: `localStorage.clear()`
- Vuelve a hacer login

### Build falla
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

**Última actualización**: Marzo 2026  
**Versión**: 1.0.0
  