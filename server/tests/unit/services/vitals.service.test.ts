import { VitalsService } from "../../../src/services/vitals.service";
import { VitalsRepository } from "../../../src/repositories/vitals.repository";
import { MedicalRecordRepository } from "../../../src/repositories/medical-record.repository";
import { UserDataService } from "../../../src/services/user-data.service";
import { RiskAssessmentService } from "../../../src/services/risk-assessment.service";

jest.mock("../../../src/repositories/vitals.repository");
jest.mock("../../../src/repositories/medical-record.repository");
jest.mock("../../../src/services/user-data.service");
jest.mock("../../../src/services/risk-assessment.service");

const VitalsRepositoryMock = VitalsRepository as jest.MockedClass<
  typeof VitalsRepository
>;
const MedicalRecordRepositoryMock = MedicalRecordRepository as jest.MockedClass<
  typeof MedicalRecordRepository
>;
const UserDataServiceMock = UserDataService as jest.MockedClass<
  typeof UserDataService
>;
const RiskAssessmentServiceMock = RiskAssessmentService as jest.MockedClass<
  typeof RiskAssessmentService
>;

const getVitalsRepo = () =>
  VitalsRepositoryMock.mock.instances[0] as jest.Mocked<VitalsRepository>;
const getMedicalRecordRepo = () =>
  MedicalRecordRepositoryMock.mock.instances[0] as jest.Mocked<MedicalRecordRepository>;
const getUserDataService = () =>
  UserDataServiceMock.mock.instances[0] as jest.Mocked<UserDataService>;
const getRiskAssessmentService = () =>
  RiskAssessmentServiceMock.mock.instances[0] as jest.Mocked<RiskAssessmentService>;

describe("VitalsService", () => {
  beforeEach(() => {
    const vitalsRepo = getVitalsRepo();
    vitalsRepo.create?.mockReset();
    vitalsRepo.getForUser?.mockReset();
    vitalsRepo.getAllForUser?.mockReset();
    vitalsRepo.getLatestForUser?.mockReset();
    vitalsRepo.update?.mockReset();
    vitalsRepo.delete?.mockReset();

    const medicalRecordRepo = getMedicalRecordRepo();
    medicalRecordRepo.addItem?.mockReset();
    medicalRecordRepo.removeItemByRef?.mockReset();

    const userDataService = getUserDataService();
    userDataService.updateLatestVitals?.mockReset();

    const riskAssessmentService = getRiskAssessmentService();
    riskAssessmentService.generateAssessment?.mockReset();
    riskAssessmentService.generateAssessment?.mockResolvedValue(null as any);
  });

  it("should create vitals, link medical record, and trigger sync services", async () => {
    const service = new VitalsService();
    const vitalsRepo = getVitalsRepo();
    const medicalRecordRepo = getMedicalRecordRepo();
    const userDataService = getUserDataService();
    const riskAssessmentService = getRiskAssessmentService();

    vitalsRepo.create.mockResolvedValue({
      _id: "v1",
      userId: "u1",
      heartRate: 82,
    } as any);
    medicalRecordRepo.addItem.mockResolvedValue({ _id: "r1" } as any);
    userDataService.updateLatestVitals.mockResolvedValue({} as any);

    const result = await service.createVitals("u1", {
      heartRate: 82,
      recordId: "r1",
    } as any);

    expect(vitalsRepo.create).toHaveBeenCalledWith({
      userId: "u1",
      heartRate: 82,
      recordId: "r1",
    });
    expect(medicalRecordRepo.addItem).toHaveBeenCalledWith("r1", "u1", {
      type: "vitals",
      refId: "v1",
    });
    expect(userDataService.updateLatestVitals).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ _id: "v1" }),
    );
    expect(riskAssessmentService.generateAssessment).toHaveBeenCalledWith("u1", {
      useLatest: true,
      includeAi: false,
      maxInsights: 2,
    });
    expect(result).toHaveProperty("_id", "v1");
  });

  it("should throw 404 when create includes unknown medical record", async () => {
    const service = new VitalsService();
    const vitalsRepo = getVitalsRepo();
    const medicalRecordRepo = getMedicalRecordRepo();

    vitalsRepo.create.mockResolvedValue({ _id: "v1", userId: "u1" } as any);
    medicalRecordRepo.addItem.mockResolvedValue(null);

    await expect(
      service.createVitals("u1", { heartRate: 70, recordId: "missing" } as any),
    ).rejects.toHaveProperty("status", 404);
  });

  it("should throw 404 when updating non-existent vitals", async () => {
    const service = new VitalsService();
    const vitalsRepo = getVitalsRepo();

    vitalsRepo.getForUser.mockResolvedValue(null);

    await expect(
      service.updateVitals("u1", "missing", { heartRate: 72 } as any),
    ).rejects.toHaveProperty("status", 404);
  });

  it("should delete vitals and clear latest vitals when none remain", async () => {
    const service = new VitalsService();
    const vitalsRepo = getVitalsRepo();
    const medicalRecordRepo = getMedicalRecordRepo();
    const userDataService = getUserDataService();

    vitalsRepo.getForUser.mockResolvedValue({ _id: "v1", userId: "u1" } as any);
    vitalsRepo.delete.mockResolvedValue(true);
    medicalRecordRepo.removeItemByRef.mockResolvedValue(true);
    vitalsRepo.getLatestForUser.mockResolvedValue(null);
    userDataService.updateLatestVitals.mockResolvedValue({} as any);

    const result = await service.deleteVitals("u1", "v1");

    expect(result).toBe(true);
    expect(medicalRecordRepo.removeItemByRef).toHaveBeenCalledWith(
      "u1",
      "vitals",
      "v1",
    );
    expect(userDataService.updateLatestVitals).toHaveBeenCalledWith("u1", null);
  });

  it("should build summary cards and trend from stored vitals", async () => {
    const service = new VitalsService();
    const vitalsRepo = getVitalsRepo();

    vitalsRepo.getAllForUser.mockResolvedValue([
      {
        _id: "old",
        recordedAt: new Date("2026-01-01T10:00:00.000Z"),
        heartRate: 70,
        systolicBp: 120,
        diastolicBp: 80,
        glucoseLevel: 95,
        bmi: 24,
      },
      {
        _id: "new",
        recordedAt: new Date("2026-01-10T10:00:00.000Z"),
        heartRate: 80,
        systolicBp: 135,
        diastolicBp: 88,
        glucoseLevel: 110,
        bmi: 27,
      },
    ] as any);

    const result = await service.getSummary("u1");

    expect(result.records).toHaveLength(2);
    expect(result.trend).toHaveLength(2);
    expect(result.trend[0].label).toBe("Start");
    expect(result.trend[1].label).toBe("Latest");

    const heartRateCard = result.cards.find((card) => card.key === "heartRate");
    const bloodPressureCard = result.cards.find(
      (card) => card.key === "bloodPressure",
    );
    const glucoseCard = result.cards.find((card) => card.key === "glucose");
    const bmiCard = result.cards.find((card) => card.key === "bmi");

    expect(heartRateCard).toMatchObject({
      value: "80",
      status: "Normal",
      delta: "+10 bpm",
    });
    expect(bloodPressureCard).toMatchObject({
      value: "135/88",
      status: "Elevated",
    });
    expect(glucoseCard).toMatchObject({
      value: "110",
      status: "Borderline",
      delta: "+15 mg/dL",
    });
    expect(bmiCard).toMatchObject({
      value: "27",
      status: "Elevated",
      delta: "+3",
    });
  });
});
