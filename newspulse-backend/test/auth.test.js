import request from "supertest";
import app from "../src/index.js";
import User from "../src/models/User.js";
import mongoose from "mongoose";

let token;

beforeAll(async () => {
  await User.deleteMany({}); // limpiar base

  // registrar usuario de prueba
  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "editor",
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth API", () => {
  it("debería loguear un usuario existente", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();

    token = res.body.data.token;
  });

  it("no debería loguear con credenciales inválidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(401); // o 500 según tu middleware
    expect(res.body.success).toBe(false);
  });

  it("no debería registrar un usuario con email duplicado", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Duplicate User",
        email: "test@example.com",
        password: "password123",
        role: "editor",
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it("no debería registrar un usuario con datos faltantes", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "new@example.com",
        // falta password y name
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});