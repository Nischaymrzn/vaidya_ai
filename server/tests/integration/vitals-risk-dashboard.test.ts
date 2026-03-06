import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";

const API = "/v1/api";

let userToken: string;
let vitalsId: string;
let riskId: string;

describe("Vitals, Risk, and Dashboard Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const email = `vrd-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Vitals Risk User",
      email,
      password: "User123!@#",
      confirmPassword: "User123!@#",
    });

    const loginRes = await request(app)
      .post(`${API}/auth/login`)
      .send({ email, password: "User123!@#" });
    userToken = loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should reject vitals summary without auth", async () => {
    const res = await request(app).get(`${API}/vitals/summary`);
    expect(res.status).toBe(401);
  });

  it("should create vitals and fetch vitals summary when authenticated", async () => {
    const createRes = await request(app)
      .post(`${API}/vitals`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        systolicBp: 136,
        diastolicBp: 88,
        heartRate: 84,
        glucoseLevel: 112,
        weight: 72,
        height: 170,
        bmi: 24.9,
        notes: "Integration vitals entry",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    vitalsId = createRes.body.data?._id;
    expect(vitalsId).toBeDefined();

    const summaryRes = await request(app)
      .get(`${API}/vitals/summary`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.success).toBe(true);
    expect(Array.isArray(summaryRes.body.data?.cards)).toBe(true);
    expect(Array.isArray(summaryRes.body.data?.trend)).toBe(true);
    expect(Array.isArray(summaryRes.body.data?.records)).toBe(true);
    expect(summaryRes.body.data.records.length).toBeGreaterThan(0);
  });

  it("should generate and fetch risk assessments", async () => {
    const generateRes = await request(app)
      .post(`${API}/risk-assessments/generate`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        includeAi: false,
        useLatest: true,
        maxInsights: 3,
      });

    expect(generateRes.status).toBe(201);
    expect(generateRes.body.success).toBe(true);
    expect(generateRes.body.data).toHaveProperty("assessment");
    expect(generateRes.body.data).toHaveProperty("insights");
    riskId = generateRes.body.data?.assessment?._id;
    expect(riskId).toBeDefined();

    const listRes = await request(app)
      .get(`${API}/risk-assessments`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const byIdRes = await request(app)
      .get(`${API}/risk-assessments/${riskId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body.success).toBe(true);
    expect(byIdRes.body.data).toHaveProperty("assessment");
    expect(String(byIdRes.body.data.assessment._id)).toBe(String(riskId));
  });

  it("should fetch dashboard summary for authenticated user", async () => {
    const res = await request(app)
      .get(`${API}/dashboard/summary`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("summaryCards");
    expect(res.body.data).toHaveProperty("vitalStats");
    expect(res.body.data).toHaveProperty("riskFactors");
    expect(Array.isArray(res.body.data.summaryCards)).toBe(true);
  });

  it("should fetch created vitals by id", async () => {
    const res = await request(app)
      .get(`${API}/vitals/${vitalsId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(String(res.body.data?._id)).toBe(String(vitalsId));
  });
});
