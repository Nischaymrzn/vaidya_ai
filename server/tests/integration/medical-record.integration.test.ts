import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";

const API = "/v1/api";

let token: string;
let recordId: string;

describe("Medical Record Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const email = `medical-record-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Medical Record User",
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

  it("should perform medical record CRUD", async () => {
    const createRes = await request(app)
      .post(`${API}/medical-records`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Annual checkup",
        recordType: "Visit",
        provider: "City Health Clinic",
        status: "Active",
        notes: "Initial baseline visit",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    recordId = createRes.body.data?._id;
    expect(recordId).toBeDefined();

    const patchRes = await request(app)
      .patch(`${API}/medical-records/${recordId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: "Follow-up note updated", status: "Reviewed" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);

    const byIdRes = await request(app)
      .get(`${API}/medical-records/${recordId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(byIdRes.status).toBe(200);
    expect(String(byIdRes.body.data?._id)).toBe(String(recordId));

    const listRes = await request(app)
      .get(`${API}/medical-records?page=1&limit=10`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const deleteRes = await request(app)
      .delete(`${API}/medical-records/${recordId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});
