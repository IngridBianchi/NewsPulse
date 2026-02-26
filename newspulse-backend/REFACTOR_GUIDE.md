# Guia de refactorización: SRP y Dependency Injection

Este documento describe los pasos y los cambios necesarios para refactorizar los controladores y servicios del backend de NewsPulse
aplicando el *Single Responsibility Principle* (SRP) y la Inyección de Dependencias (DI). Se propone un esquema gradual para convertir el
código actual en una estructura más modular y testeable.

---

## 📌 Objetivos principales

1. Separar las responsabilidades: los controladores sólo gestionan la entrada/salida HTTP, los servicios contienen la lógica del dominio.
2. Evitar acoplamientos directos a Mongoose en servicios y controladores; utilizar repositorios o interfaces como abstracciones.
3. Facilitar sustitución de dependencias en tests (mocks/esporádicos) y permitir escalado (por ejemplo, cambiar la base de datos).
4. Mantener el mismo comportamiento funcional, sin introducir nuevas rutas ni romper el contrato existente con los clientes.

---

## 🛠 Estructura propuesta de módulos

```
src/
├── controllers/
│   ├── authController.js        # exporta creadores de controlador
│   ├── newsController.js        # idem
│   ├── recommendationController.js
│   ├── searchController.js
│   └── summaryController.js
│
├── services/
│   ├── authService.js           # crea servicio inyectable
│   ├── newsService.js
│   ├── newsApiService.js
│   ├── newsClassifier.js
│   ├── aiService.js
│   └── newsSummarizer.js
│
├── repositories/                # nuevos, contienen acceso a datos
│   ├── userRepository.js
│   └── newsRepository.js
│
├── config/
│   └── di.js                    # "contenedor" manual de dependencias
└── routes/                      # se modifican para requerir controladores
```

---

## 🔎 Paso a paso: refactorización de un caso completo

### 1. Repositorios (Data Access)

Crear en `src/repositories/newsRepository.js`:

```js
// src/repositories/newsRepository.js
export function createNewsRepository(NewsModel) {
  return {
    create: (data) => new NewsModel(data).save(),
    find: (query) => NewsModel.find(query),
    findById: (id) => NewsModel.findById(id),
    updateById: (id, updates) => NewsModel.findByIdAndUpdate(id, updates, { new: true }),
    deleteById: (id) => NewsModel.findByIdAndDelete(id),
    countDocuments: (query) => NewsModel.countDocuments(query),
    // cualquier otro método especializado
  };
}
```

Y similar para usuarios en `src/repositories/userRepository.js`.

> **Motivo**: Encapsular Mongoose en un solo lugar; el resto del sistema no conoce la implementación.

### 2. Servicios convertidos en fábricas

**Antes** (ejemplo parcial de `newsService.js`):

```js
import News from "../models/News.js";

export async function getNews({ page = 1, limit = 10, search = "" }) {
  const query = search ? { ... } : {};
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([...] );
  return { data, total, page, pages: Math.ceil(total / limit) };
}
```

**Después**: servicio recibe `newsRepo` como dependencia.

```js
// src/services/newsService.js
export function createNewsService(newsRepo) {
  return {
    async list({ page = 1, limit = 10, search = "" }) {
      const query = search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { content: { $regex: search, $options: "i" } },
            ],
          }
        : {};
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        newsRepo.find(query).sort({ date: -1 }).skip(skip).limit(limit),
        newsRepo.countDocuments(query),
      ]);
      return { data, total, page, pages: Math.ceil(total / limit) };
    },

    async getById(id) {
      return newsRepo.findById(id);
    },

    async create(data) {
      return newsRepo.create(data);
    },

    async update(id, updates) {
      return newsRepo.updateById(id, updates);
    },

    async delete(id) {
      return newsRepo.deleteById(id);
    },

    // otros métodos que antes estaban aquí
  };
}
```

> El servicio ya no importa `News` ni sabe de Mongoose; sólo opera sobre la interfaz del repositorio.

### 3. Controladores convertidos en fábricas

En `src/controllers/newsController.js`:

```js
// src/controllers/newsController.js
export function createNewsController(newsService) {
  return {
    async create(req, res, next) {
      try {
        const news = await newsService.create(req.body);
        res.status(201).json({ success: true, data: news });
      } catch (err) {
        next(err);
      }
    },

    async list(req, res, next) {
      try {
        const result = await newsService.list(req.query);
        res.json({ success: true, ...result });
      } catch (err) {
        next(err);
      }
    },

    // método getById, update, delete, etc. similares
  };
}
```

> El controlador no conoce ningún modelo, sólo la interfaz `newsService`. En los tests podemos pasarle un objeto con `create`, `list`, etc. stubbed.

### 4. Ajuste de rutas

`src/routes/news.js` debe importar los controladores desde el contenedor DI:

```js
import express from "express";
import { newsController } from "../config/di.js"; // ver más abajo

const router = express.Router();

router.post("/", auth, authorizeRoles("admin","editor"), validators, newsController.create);
router.get("/", newsController.list);
// …

export default router;
```

### 5. Configuración del contenedor (DI manual)

Crear `src/config/di.js` que arme instancias reales:

```js
import News from "../models/News.js";
import User from "../models/User.js";
import { createNewsRepository } from "../repositories/newsRepository.js";
import { createUserRepository } from "../repositories/userRepository.js";
import { createNewsService } from "../services/newsService.js";
import { createAuthService } from "../services/authService.js";
import { createNewsController } from "../controllers/newsController.js";
import { createAuthController } from "../controllers/authController.js";

// repos
const newsRepo = createNewsRepository(News);
const userRepo = createUserRepository(User);

// servicios
export const newsService = createNewsService(newsRepo);
export const authService = createAuthService(userRepo);

// controladores
export const newsController = createNewsController(newsService);
export const authController = createAuthController(authService);

// exportar también otros servicios/controladores según necesidad
```

> Con DI manual no hay librería extra; el simple hecho de pasar objetos permite mocking fácil.

### 6. Actualización de tests existentes

En `test/news.test.js` y `test/auth.test.js`, en lugar de levantar la aplicación completa puedes instanciar controladores con mocks y probar sólo la lógica del controller. Para pruebas de integración completas, la aplicación sigue funcionando igual porque `index.js` importa las rutas que usan el contenedor.

Ejemplo de test unitario para controlador de noticias:

```js
import { createNewsController } from "../src/controllers/newsController.js";

test("list devuelve datos", async () => {
  const fakeService = { list: jest.fn().mockResolvedValue({ data: [1, 2, 3], total:3, page:1, pages:1 }) };
  const ctrl = createNewsController(fakeService);

  const req = { query: {} };
  const res = { json: jest.fn() };
  const next = jest.fn();

  await ctrl.list(req, res, next);
  expect(res.json).toHaveBeenCalledWith({ success: true, data: [1,2,3], total:3, page:1, pages:1 });
});
```

### 7. Refactorizar el resto de servicios/controladores

Repetir la estrategia para:
- `authController` / `authService` usando `userRepo`.
- `summaryController` / `newsSummarizer` (inyectando también `aiService` si se desea).
- `recommendationController` (requiere `userService` y `newsService`).
- `searchController` (recibe un servicio de búsquedas o `newsService` con un método `search`).
- `newsApiService` puede ser un módulo que reciba `newsRepo` + `classifier`/`aiService` en sus funciones exportadas.

### 8. Principio SRP: qué mover

- Validaciones y middleware se mantienen en rutas o en módulos `validators` separados.
- Las funciones de creación/actualización de objetos y de clasificación/resumen deben quedarse en los servicios.
- Los controladores ya no deben tener consultas Mongoose (ni `News.find`, `News.findById`, etc.).

---

## 🗂 Resumen de modificación por archivo

| Archivo actual               | Cambios principales                                 | Resultado esperado
|-----------------------------|-----------------------------------------------------|-------------------
| src/controllers/*.js        | Convertir en exportadores de fábricas (crearController) | controladores ligeros, testables
| src/services/*.js           | Recibir dependencias en lugar de importar modelos   | lógica desacoplada
| + nuevos repositorios       | Métodos CRUD encapsulados                          | capa de datos independiente
| src/config/di.js            | Montar objetos reales a inyectar                   | punto único de configuración
| src/routes/*.js             | Importar controladores desde el contenedor         | nada cambia para consumidores
| tests/unitarios (nuevo dir) | crear pruebas que usen mocks de repositories/servicios | más cobertura y velocidad


---

## 🧩 Beneficios

- **SRP**: cada módulo tiene una responsabilidad clara y única, facilitando el mantenimiento.
- **DI**: permite sustituir fácilmente implementaciones (Mocks, stub, versiones alternativas).
- Mejora la **testabilidad**: puedes escribir tests unitarios sin arranque de Express ni conexiones de base de datos.
- Compatibilidad con futuros **patternes**: repositorios, servicios compuestos, contenedores IoC.
- Facilita separar en paquetes/microservicios si el proyecto crece.

---

## 🛎 Recomendaciones adicionales

- Documentar las interfaces de los repositorios (p.ej. usando JSDoc o TypeScript). 
- Considerar el uso de un contenedor ligero (Awilix, Bottle.js) cuando el número de dependencias escale.
- Mantener un estilo consistente en la nomenclatura (`createXService`, `createXController`).
- Añadir validación de parámetros en los servicios si es necesario (por ejemplo, `list({ page, limit })`).

---

Implementando los pasos anteriores tu código cumplirá SRP y será mucho más modular y preparado para cambios futuros. Si deseas ejemplos concretos de conversión de archivos adicionales o un diagrama de dependencias, házmelo saber. ¡Listo para empezar a refactorizar! 🚀