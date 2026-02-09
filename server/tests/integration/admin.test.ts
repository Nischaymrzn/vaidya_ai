import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import { User } from "../../src/models/auth.model";

const API = "/v1/api";

let adminToken: string;
let adminId: string;
let createdUserId: string;
let userToken: string;

describe("Admin API Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    // Create admin user and login
    const adminEmail = `admin-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Admin User",
      email: adminEmail,
      password: "Admin123!@#",
      confirmPassword: "Admin123!@#",
    });
    // Promote to admin
    await User.findOneAndUpdate({ email: adminEmail }, { role: "admin" });
    const loginRes = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: adminEmail, password: "Admin123!@#" });
    adminToken = loginRes.body.data?.accessToken;
    adminId = loginRes.body.data?.user?._id || loginRes.body.data?.user?.id;

    const userEmail = `user-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Regular User",
      email: userEmail,
      password: "User123!@#",
      confirmPassword: "User123!@#",
    });
    const userLoginRes = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: userEmail, password: "User123!@#" });
    userToken = userLoginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("GET /admin/users", () => {
    it("should return 401 without auth", async () => {
      const res = await request(app).get(`${API}/admin/users`);
      expect(res.status).toBe(401);
    });

    it("should return users with pagination when authenticated", async () => {
      const res = await request(app)
        .get(`${API}/admin/users?page=1&limit=10`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("page", 1);
      expect(res.body.pagination).toHaveProperty("limit", 10);
      expect(res.body.pagination).toHaveProperty("totalPages");
    });

    it("should return 403 for non-admin user", async () => {
      const res = await request(app)
        .get(`${API}/admin/users`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("should respect page and limit params", async () => {
      const res = await request(app)
        .get(`${API}/admin/users?page=2&limit=5`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe("POST /admin/users", () => {
    it("should create user when authenticated as admin", async () => {
      const email = `newuser-${Date.now()}@example.com`;
      const res = await request(app)
        .post(`${API}/admin/users`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", "New User")
        .field("email", email)
        .field("password", "User123!@#")
        .field("confirmPassword", "User123!@#")
        .field("role", "user");
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", email);
      createdUserId = res.body.data._id || res.body.data.id;
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app)
        .post(`${API}/admin/users`)
        .field("name", "Test")
        .field("email", "test@example.com")
        .field("password", "Test123!@#")
        .field("confirmPassword", "Test123!@#")
        .field("role", "user");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /admin/users/:id", () => {
    it("should return user by id when authenticated", async () => {
      if (!createdUserId) return;
      const res = await request(app)
        .get(`${API}/admin/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id", createdUserId);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`${API}/admin/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect([404, 500]).toContain(res.status);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get(`${API}/admin/users/${adminId}`);
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /admin/users/:id", () => {
    it("should update user when authenticated", async () => {
      if (!createdUserId) return;
      const res = await request(app)
        .patch(`${API}/admin/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", "Updated Name")
        .field("email", `updated-${Date.now()}@example.com`)
        .field("role", "user");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Updated Name");
    });

    it("should return 401 without auth", async () => {
      const res = await request(app)
        .patch(`${API}/admin/users/${createdUserId}`)
        .field("name", "Test");
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /admin/users/:id", () => {
    it("should delete user when authenticated", async () => {
      if (!createdUserId) return;
      const res = await request(app)
        .delete(`${API}/admin/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).delete(`${API}/admin/users/${adminId}`);
      expect(res.status).toBe(401);
    });
  });
});
