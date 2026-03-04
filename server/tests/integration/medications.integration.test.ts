import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";

const API = "/v1/api";

let token: string;
let medicationId: string;

describe("Medications Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const email = `medications-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Medications User",
      email,
      password: "User123!@#",
      confirmPassword: "User123!@#",
    });

    const loginRes = await request(app).post(`${API}/auth/login`).send({
      email,
      password: "User123!@#",
    });
    token = loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should perform medications CRUD", async () => {
    const createRes = await request(app)
      .post(`${API}/medications`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        medicineName: "Metformin",
        dosage: "500mg",
        frequency: "daily",
        purpose: "Sugar control",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    medicationId = createRes.body.data?._id;
    expect(medicationId).toBeDefined();

    const patchRes = await request(app)
      .patch(`${API}/medications/${medicationId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dosage: "850mg", frequency: "twice daily" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);

    const byIdRes = await request(app)
      .get(`${API}/medications/${medicationId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(byIdRes.status).toBe(200);
    expect(String(byIdRes.body.data?._id)).toBe(String(medicationId));

    const listRes = await request(app)
      .get(`${API}/medications`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const deleteRes = await request(app)
      .delete(`${API}/medications/${medicationId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});
