import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";

const API = "/v1/api";

let userToken: string;
let userId: string;
let userEmail: string;

describe("User API Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    userEmail = `user-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Regular User",
      email: userEmail,
      password: "User123!@#",
      confirmPassword: "User123!@#",
    });

    const loginRes = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: userEmail, password: "User123!@#" });

    userToken = loginRes.body.data?.accessToken;
    userId = loginRes.body.data?.user?._id || loginRes.body.data?.user?.id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /users/:id", () => {
    it("should return 401 without auth", async () => {
      const res = await request(app).get(`${API}/users/${userId}`);
      expect(res.status).toBe(401);
    });

    it("should return user by id when authenticated", async () => {
      const res = await request(app)
        .get(`${API}/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id", userId);
    });
  });

  describe("PUT /users/:id", () => {
    it("should update user when authenticated", async () => {
      const res = await request(app)
        .put(`${API}/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .field("name", "Updated User")
        .field("email", userEmail);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Updated User");
    });

    it("should return 401 without auth", async () => {
      const res = await request(app)
        .put(`${API}/users/${userId}`)
        .field("name", "No Auth")
        .field("email", userEmail);
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user when authenticated", async () => {
      const res = await request(app)
        .delete(`${API}/users/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).delete(`${API}/users/${userId}`);
      expect(res.status).toBe(401);
    });
  });
});
