import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";

const API = "/v1/api";

let userToken: string;
let vitalsId: string;
let medicationId: string;
let symptomsId: string;
let allergyId: string;
let medicalRecordId: string;

describe("Health Modules Integration Tests", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const email = `modules-${Date.now()}@example.com`;
    await request(app).post(`${API}/auth/register`).send({
      name: "Health Modules User",
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

  describe("Vitals CRUD", () => {
    it("should create, update, fetch, and delete vitals", async () => {
      const createRes = await request(app)
        .post(`${API}/vitals`)
        .set("Authorization", `Bearer ${userToken}`)
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
        .set("Authorization", `Bearer ${userToken}`)
        .send({ heartRate: 86, glucoseLevel: 112 });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.heartRate).toBe(86);

      const byIdRes = await request(app)
        .get(`${API}/vitals/${vitalsId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(byIdRes.status).toBe(200);
      expect(String(byIdRes.body.data?._id)).toBe(String(vitalsId));

      const deleteRes = await request(app)
        .delete(`${API}/vitals/${vitalsId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe("Medical Records CRUD", () => {
    it("should create, update, list, fetch, and delete medical record", async () => {
      const createRes = await request(app)
        .post(`${API}/medical-records`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Annual checkup",
          recordType: "Visit",
          provider: "City Health Clinic",
          status: "Active",
          notes: "Initial baseline visit",
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      medicalRecordId = createRes.body.data?._id;
      expect(medicalRecordId).toBeDefined();

      const patchRes = await request(app)
        .patch(`${API}/medical-records/${medicalRecordId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ notes: "Follow-up note updated", status: "Reviewed" });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.notes).toBe("Follow-up note updated");

      const listRes = await request(app)
        .get(`${API}/medical-records?page=1&limit=10`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);

      const byIdRes = await request(app)
        .get(`${API}/medical-records/${medicalRecordId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(byIdRes.status).toBe(200);
      expect(String(byIdRes.body.data?._id)).toBe(String(medicalRecordId));

      const deleteRes = await request(app)
        .delete(`${API}/medical-records/${medicalRecordId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe("Medications CRUD", () => {
    it("should create, update, list, fetch, and delete medication", async () => {
      const createRes = await request(app)
        .post(`${API}/medications`)
        .set("Authorization", `Bearer ${userToken}`)
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
        .set("Authorization", `Bearer ${userToken}`)
        .send({ dosage: "850mg" });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.dosage).toBe("850mg");

      const listRes = await request(app)
        .get(`${API}/medications`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);

      const byIdRes = await request(app)
        .get(`${API}/medications/${medicationId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(byIdRes.status).toBe(200);
      expect(String(byIdRes.body.data?._id)).toBe(String(medicationId));

      const deleteRes = await request(app)
        .delete(`${API}/medications/${medicationId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe("Symptoms CRUD", () => {
    it("should create, update, list, fetch, and delete symptoms", async () => {
      const createRes = await request(app)
        .post(`${API}/symptoms`)
        .set("Authorization", `Bearer ${userToken}`)
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
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "resolved", durationDays: 5 });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.status).toBe("resolved");

      const listRes = await request(app)
        .get(`${API}/symptoms`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);

      const byIdRes = await request(app)
        .get(`${API}/symptoms/${symptomsId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(byIdRes.status).toBe(200);
      expect(String(byIdRes.body.data?._id)).toBe(String(symptomsId));

      const deleteRes = await request(app)
        .delete(`${API}/symptoms/${symptomsId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe("Allergy CRUD", () => {
    it("should create, update, list, fetch, and delete allergy", async () => {
      const createRes = await request(app)
        .post(`${API}/allergies`)
        .set("Authorization", `Bearer ${userToken}`)
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
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "resolved" });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.status).toBe("resolved");

      const listRes = await request(app)
        .get(`${API}/allergies`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);

      const byIdRes = await request(app)
        .get(`${API}/allergies/${allergyId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(byIdRes.status).toBe(200);
      expect(String(byIdRes.body.data?._id)).toBe(String(allergyId));

      const deleteRes = await request(app)
        .delete(`${API}/allergies/${allergyId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });
});
