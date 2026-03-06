import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";

const API = "/v1/api";

let token: string;
let allergyId: string;

describe("Allergy Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const email = `allergy-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Allergy User",
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

  it("should perform allergy CRUD", async () => {
    const createRes = await request(app)
      .post(`${API}/allergies`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        allergen: "Peanut",
        type: "food",
        severity: "moderate",
        status: "active",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    allergyId = createRes.body.data?._id;
    expect(allergyId).toBeDefined();

    const patchRes = await request(app)
      .patch(`${API}/allergies/${allergyId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "resolved" });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);

    const byIdRes = await request(app)
      .get(`${API}/allergies/${allergyId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(byIdRes.status).toBe(200);
    expect(String(byIdRes.body.data?._id)).toBe(String(allergyId));

    const listRes = await request(app)
      .get(`${API}/allergies`)
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const deleteRes = await request(app)
      .delete(`${API}/allergies/${allergyId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

