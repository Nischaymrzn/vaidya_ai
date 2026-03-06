import { SymptomsService } from "../../../src/services/symptoms.service";
import { SymptomsRepository } from "../../../src/repositories/symptoms.repository";
import { MedicalRecordRepository } from "../../../src/repositories/medical-record.repository";
import { RiskAssessmentService } from "../../../src/services/risk-assessment.service";

jest.mock("../../../src/repositories/symptoms.repository");
jest.mock("../../../src/repositories/medical-record.repository");
jest.mock("../../../src/services/risk-assessment.service");

const SymptomsRepositoryMock = SymptomsRepository as jest.MockedClass<
  typeof SymptomsRepository
>;
const MedicalRecordRepositoryMock = MedicalRecordRepository as jest.MockedClass<
  typeof MedicalRecordRepository
>;
const RiskAssessmentServiceMock = RiskAssessmentService as jest.MockedClass<
  typeof RiskAssessmentService
>;

const getSymptomsRepo = () =>
  SymptomsRepositoryMock.mock.instances[0] as jest.Mocked<SymptomsRepository>;
const getMedicalRecordRepo = () =>
  MedicalRecordRepositoryMock.mock.instances[0] as jest.Mocked<MedicalRecordRepository>;
const getRiskAssessmentService = () =>
  RiskAssessmentServiceMock.mock.instances[0] as jest.Mocked<RiskAssessmentService>;

describe("SymptomsService", () => {
  beforeEach(() => {
    const symptomsRepo = getSymptomsRepo();
    symptomsRepo.create?.mockReset();
    symptomsRepo.getForUser?.mockReset();
    symptomsRepo.getAllForUser?.mockReset();
    symptomsRepo.update?.mockReset();
    symptomsRepo.delete?.mockReset();

    const medicalRecordRepo = getMedicalRecordRepo();
    medicalRecordRepo.getRecordForUser?.mockReset();
    medicalRecordRepo.addItem?.mockReset();
    medicalRecordRepo.removeItemByRef?.mockReset();

    const riskService = getRiskAssessmentService();
    riskService.generateAssessment?.mockReset();
    riskService.generateAssessment?.mockResolvedValue(null as any);
  });

  it("should create symptoms, link medical record, and trigger risk refresh", async () => {
    const service = new SymptomsService();
    const symptomsRepo = getSymptomsRepo();
    const medicalRecordRepo = getMedicalRecordRepo();
    const riskService = getRiskAssessmentService();

    medicalRecordRepo.getRecordForUser.mockResolvedValue({
      _id: "r1",
      diagnosis: "Migraine",
    } as any);
    symptomsRepo.create.mockResolvedValue({
      _id: "s1",
      userId: "u1",
      symptomList: ["Headache"],
      diagnosis: "Migraine",
      disease: "Migraine",
    } as any);
    medicalRecordRepo.addItem.mockResolvedValue({ _id: "r1" } as any);

    const result = await service.createSymptoms("u1", {
      symptomList: ["Headache"],
      recordId: "r1",
    } as any);

    expect(symptomsRepo.create).toHaveBeenCalledWith({
      userId: "u1",
      symptomList: ["Headache"],
      recordId: "r1",
      diagnosis: "Migraine",
      disease: "Migraine",
    });
    expect(medicalRecordRepo.addItem).toHaveBeenCalledWith("r1", "u1", {
      type: "symptoms",
      refId: "s1",
    });
    expect(riskService.generateAssessment).toHaveBeenCalledWith("u1", {
      useLatest: true,
      includeAi: false,
      maxInsights: 2,
    });
    expect(result).toHaveProperty("_id", "s1");
  });

  it("should throw 404 when updating missing symptoms", async () => {
    const service = new SymptomsService();
    const symptomsRepo = getSymptomsRepo();

    symptomsRepo.getForUser.mockResolvedValue(null);

    await expect(
      service.updateSymptoms("u1", "missing", { severity: "moderate" } as any),
    ).rejects.toHaveProperty("status", 404);
  });

  it("should delete symptoms and unlink from medical records", async () => {
    const service = new SymptomsService();
    const symptomsRepo = getSymptomsRepo();
    const medicalRecordRepo = getMedicalRecordRepo();

    symptomsRepo.getForUser.mockResolvedValue({ _id: "s1" } as any);
    symptomsRepo.delete.mockResolvedValue(true);
    medicalRecordRepo.removeItemByRef.mockResolvedValue(true);

    const result = await service.deleteSymptoms("u1", "s1");

    expect(result).toBe(true);
    expect(medicalRecordRepo.removeItemByRef).toHaveBeenCalledWith(
      "u1",
      "symptoms",
      "s1",
    );
  });
});
