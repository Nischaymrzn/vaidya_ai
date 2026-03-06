import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";

const API = "/v1/api";

let token: string;
let vitalsId: string;

describe("Vitals Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const email = `vitals-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Vitals User",
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

  it("should perform vitals CRUD", async () => {
    const createRes = await request(app)
      .post(`${API}/vitals`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        systolicBp: 130,
        diastolicBp: 84,
        heartRate: 80,
        glucoseLevel: 105,
        bmi: 24.4,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    vitalsId = createRes.body.data?._id;
    expect(vitalsId).toBeDefined();

    const patchRes = await request(app)
      .patch(`${API}/vitals/${vitalsId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ heartRate: 86, glucoseLevel: 112 });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);

    const byIdRes = await request(app)
      .get(`${API}/vitals/${vitalsId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(byIdRes.status).toBe(200);
    expect(String(byIdRes.body.data?._id)).toBe(String(vitalsId));

    const listRes = await request(app)
      .get(`${API}/vitals`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const deleteRes = await request(app)
      .delete(`${API}/vitals/${vitalsId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

