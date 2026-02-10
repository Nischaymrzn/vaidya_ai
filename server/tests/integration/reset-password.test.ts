import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const API = "/v1/api";

describe("Reset Password Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /auth/request-password-reset", () => {
    it("should accept valid email and return success", async () => {
      const res = await request(app)
        .post(`${API}/auth/request-password-reset`)
        .send({ email: "valid@example.com" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("POST /auth/reset-password/:token", () => {
    it("should reject invalid token", async () => {
      const res = await request(app)
        .post(`${API}/auth/reset-password/invalid-token`)
        .send({ newPassword: "NewPass123!@#" });
      expect(res.status).toBe(400);
    });

    it("should reject expired token", async () => {
      const expiredToken = jwt.sign(
        { id: new mongoose.Types.ObjectId() },
        process.env.PASSWORD_RESET_SECRET!,
        { expiresIn: "-1h" }
      );
      const res = await request(app)
        .post(`${API}/auth/reset-password/${expiredToken}`)
        .send({ newPassword: "NewPass123!@#" });
      expect(res.status).toBe(400);
    });

    it("should reject weak new password", async () => {
      const token = jwt.sign(
        { id: new mongoose.Types.ObjectId() },
        process.env.PASSWORD_RESET_SECRET!,
        { expiresIn: "1h" }
      );
      const res = await request(app)
        .post(`${API}/auth/reset-password/${token}`)
        .send({ newPassword: "weak" });
      expect(res.status).toBe(400);
    });

    it("should reject missing newPassword", async () => {
      const token = jwt.sign(
        { id: new mongoose.Types.ObjectId() },
        process.env.PASSWORD_RESET_SECRET!,
        { expiresIn: "1h" }
      );
      const res = await request(app)
        .post(`${API}/auth/reset-password/${token}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
