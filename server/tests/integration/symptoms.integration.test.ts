import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";

const API = "/v1/api";

let token: string;
let symptomsId: string;

describe("Symptoms Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const email = `symptoms-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Symptoms User",
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

  it("should perform symptoms CRUD", async () => {
    const createRes = await request(app)
      .post(`${API}/symptoms`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        symptomList: ["Headache", "Fatigue"],
        severity: "moderate",
        status: "ongoing",
        durationDays: 3,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    symptomsId = createRes.body.data?._id;
    expect(symptomsId).toBeDefined();

    const patchRes = await request(app)
      .patch(`${API}/symptoms/${symptomsId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "resolved", durationDays: 5 });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);

    const byIdRes = await request(app)
      .get(`${API}/symptoms/${symptomsId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(byIdRes.status).toBe(200);
    expect(String(byIdRes.body.data?._id)).toBe(String(symptomsId));

    const listRes = await request(app)
      .get(`${API}/symptoms`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const deleteRes = await request(app)
      .delete(`${API}/symptoms/${symptomsId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

