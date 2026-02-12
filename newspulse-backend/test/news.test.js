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
    .send({ email: "editor@example.com", password: "password123" });
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
      .send({
        title: "Nueva noticia",
        content: "Contenido de prueba con más de 10 caracteres",
      });

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
      .send({ title: "Update inexistente" });

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
});