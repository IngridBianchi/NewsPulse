import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import mongoose from "mongoose";

let token;
let lectorToken;
let createdNewsId;

beforeAll(async () => {
  await mongoose.connection.asPromise();
  await User.deleteMany({}); // limpiar base
  
  // registrar usuario editor
  await request(app).post("/api/auth/register").send({
    name: "Editor User",
    email: "editor@example.com",
    password: "password123",
    role: "editor",
  });

  const resEditor = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json") // 👈 aseguramos JSON
    .send({ email: "editor@example.com", password: "password123" });
  console.log("Editor login response:", resEditor.statusCode, resEditor.body);

  expect(resEditor.statusCode).toBe(200);
  token = resEditor.body.data.token;

  // registrar usuario lector
  await request(app).post("/api/auth/register").send({
    name: "Lector User",
    email: "lector@example.com",
    password: "password123",
    role: "lector",
  });

  const resLector = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json") // 👈 aseguramos JSON
    .send({ email: "lector@example.com", password: "password123" });
  expect(resLector.statusCode).toBe(200);
  lectorToken = resLector.body.data.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("News API", () => {
  it("debería crear una noticia (editor/admin)", async () => {
    const res = await request(app)
      .post("/api/news")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json") // 👈 aseguramos JSON
      .send({
        title: "Nueva noticia",
        content: "Contenido de prueba con más de 10 caracteres",
      });
    
    console.log("Create news response:", res.statusCode, res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Nueva noticia");
    createdNewsId = res.body.data._id; // guardamos ID para update/delete
  }, 10000);

  it("debería listar noticias con paginación", async () => {
    const res = await request(app).get("/api/news?page=1&limit=5");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it("debería buscar noticias por contenido", async () => {
    const res = await request(app).get("/api/news?search=prueba");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("no debería permitir crear noticia sin token", async () => {
    const res = await request(app)
      .post("/api/news")
      .set("Content-Type", "application/json") // 👈 aseguramos JSON
      .send({
        title: "Noticia sin token",
        content: "Contenido inválido porque no hay token",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("no debería permitir crear noticia con rol lector", async () => {
    const res = await request(app)
      .post("/api/news")
      .set("Authorization", `Bearer ${lectorToken}`)
      .set("Content-Type", "application/json") // 👈 aseguramos JSON
      .send({
        title: "Noticia lector",
        content: "Contenido de prueba con rol lector",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("no debería permitir crear noticia con título vacío", async () => {
    const res = await request(app)
      .post("/api/news")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json") // 👈 aseguramos JSON
      .send({
        title: "",
        content: "Contenido válido pero título vacío",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("debería actualizar una noticia existente", async () => {
    const res = await request(app)
      .put(`/api/news/${createdNewsId}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json") // 👈 aseguramos JSON
      .send({
        title: "Noticia actualizada",
        content: "Contenido actualizado de la noticia",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Noticia actualizada");
  });

  it("debería eliminar una noticia existente", async () => {
    const res = await request(app)
      .delete(`/api/news/${createdNewsId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Noticia eliminada correctamente");
  });

  it("debería devolver 404 al actualizar noticia inexistente", async () => {
    const res = await request(app)
      .put("/api/news/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json") // 👈 aseguramos JSON
      .send({ title: "Update inexistente",
  content: "Contenido inexistente con más de 10 caracteres"
 });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("debería devolver 404 al eliminar noticia inexistente", async () => {
    const res = await request(app)
      .delete("/api/news/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // ----------------------------------------------------------------
  // pruebas adicionales: historial y recomendaciones
  // ----------------------------------------------------------------
  it("debería agregar lectura al historial y obtener recomendaciones", async () => {
    // crear unas noticias en diferentes categorías
    const catNews = [
      { title: "Política 1", content: "Contenido largo", category: "Política" },
      { title: "Política 2", content: "Contenido largo", category: "Política" },
      { title: "Tecnología 1", content: "Contenido largo", category: "Tecnología" },
    ];
    for (const n of catNews) {
      await request(app)
        .post("/api/news")
        .set("Authorization", `Bearer ${token}`)
        .send(n);
    }

    // lector marca como leída la primera política
    const all = await request(app).get("/api/news");
    const firstPol = all.body.data.find((x) => x.category === "Política");
    expect(firstPol).toBeDefined();

    const addRes = await request(app)
      .post("/api/user/history")
      .set("Authorization", `Bearer ${lectorToken}`)
      .send({ newsId: firstPol._id });
    expect(addRes.statusCode).toBe(200);
    expect(addRes.body.success).toBe(true);

    // ahora solicitamos recomendaciones para el lector
    const recRes = await request(app)
      .get("/api/user/recommendations")
      .set("Authorization", `Bearer ${lectorToken}`);
    expect(recRes.statusCode).toBe(200);
    expect(recRes.body.success).toBe(true);
    // should recommend other Política news, not the one already read
    const recs = recRes.body.recommendations;
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.every((r) => r.category === "Política")).toBe(true);
  });
});