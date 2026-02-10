import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";

const API = "/v1/api";

describe("Auth API Integration Tests", () => {
  let accessToken: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /auth/register", () => {
    it("should register a new user with valid data", async () => {
      const email = `test-${Date.now()}@example.com`;
      const res = await request(app)
        .post(`${API}/auth/register`)
        .send({
          name: "Test User",
          email,
          password: "Test123!@#",
          confirmPassword: "Test123!@#",
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", email);
      expect(res.body.data).toHaveProperty("name", "Test User");
    });

    it("should reject registration with duplicate email", async () => {
      const email = `dup-${Date.now()}@example.com`;
      await request(app)
        .post(`${API}/auth/register`)
        .send({
          name: "User 1",
          email,
          password: "Test123!@#",
          confirmPassword: "Test123!@#",
        });
      const res = await request(app)
        .post(`${API}/auth/register`)
        .send({
          name: "User 2",
          email,
          password: "Test123!@#",
          confirmPassword: "Test123!@#",
        });
      expect(res.status).toBe(409);
    });

    it("should reject registration with invalid email", async () => {
      const res = await request(app)
        .post(`${API}/auth/register`)
        .send({
          name: "Test",
          email: "invalid-email",
          password: "Test123!@#",
          confirmPassword: "Test123!@#",
        });
      expect(res.status).toBe(400);
    });

    it("should reject registration with password mismatch", async () => {
      const res = await request(app)
        .post(`${API}/auth/register`)
        .send({
          name: "Test",
          email: "test@example.com",
          password: "Test123!@#",
          confirmPassword: "Different123!",
        });
      expect(res.status).toBe(400);
    });

    it("should reject registration with weak password", async () => {
      const res = await request(app)
        .post(`${API}/auth/register`)
        .send({
          name: "Test",
          email: "test@example.com",
          password: "short",
          confirmPassword: "short",
        });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    const testEmail = `login-${Date.now()}@example.com`;

    beforeAll(async () => {
      await request(app)
        .post(`${API}/auth/register`)
        .send({
          name: "Login Test",
          email: testEmail,
          password: "Test123!@#",
          confirmPassword: "Test123!@#",
        });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: testEmail, password: "Test123!@#" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
      expect(res.body.data).toHaveProperty("user");
      accessToken = res.body.data.accessToken;
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: testEmail, password: "WrongPass123!" });
      expect(res.status).toBe(409);
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: "nonexistent@example.com", password: "Test123!@#" });
      expect(res.status).toBe(400);
    });

    it("should reject login with missing email", async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ password: "Test123!@#" });
      expect(res.status).toBe(400);
    });

    it("should reject login with missing password", async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: testEmail });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/request-password-reset", () => {
    it("should accept valid email for password reset", async () => {
      const res = await request(app)
        .post(`${API}/auth/request-password-reset`)
        .send({ email: "reset@example.com" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject request with invalid email format", async () => {
      const res = await request(app)
        .post(`${API}/auth/request-password-reset`)
        .send({ email: "invalid" });
      expect(res.status).toBe(400);
    });

    it("should reject request with missing email", async () => {
      const res = await request(app)
        .post(`${API}/auth/request-password-reset`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("GET /auth/me", () => {
    it("should return current user when authenticated", async () => {
      const res = await request(app)
        .get(`${API}/auth/me`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get(`${API}/auth/me`);
      expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get(`${API}/auth/me`)
        .set("Authorization", "Bearer invalid-token");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /auth/google/status", () => {
    it("should return google configuration status", async () => {
      const res = await request(app).get(`${API}/auth/google/status`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("configured");
    });
  });

  describe("GET /auth/google", () => {
    it("should redirect to google oauth when configured", async () => {
      const res = await request(app).get(`${API}/auth/google`);
      expect([302, 307]).toContain(res.status);
    });
  });
});
