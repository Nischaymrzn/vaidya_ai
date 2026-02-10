import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import { User } from "../../src/models/auth.model";

const API = "/v1/api";

let adminToken: string;

describe("Pagination Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const adminEmail = `pag-admin-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Pagination Admin",
      email: adminEmail,
      password: "Admin123!@#",
      confirmPassword: "Admin123!@#",
    });
    await User.findOneAndUpdate({ email: adminEmail }, { role: "admin" });
    const loginRes = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: adminEmail, password: "Admin123!@#" });
    adminToken = loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return pagination metadata with users", async () => {
    const res = await request(app)
      .get(`${API}/admin/users?page=1&limit=5`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 5,
      totalPages: expect.any(Number),
      hasNext: expect.any(Boolean),
      hasPrev: expect.any(Boolean),
    });
  });

  it("should cap limit at 100", async () => {
    const res = await request(app)
      .get(`${API}/admin/users?page=1&limit=200`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
  });

  it("should default to page 1 when invalid", async () => {
    const res = await request(app)
      .get(`${API}/admin/users?page=-1&limit=10`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });
});
