import { MedicationsService } from "../../../src/services/medications.service";
import { MedicationsRepository } from "../../../src/repositories/medications.repository";
import { MedicalRecordRepository } from "../../../src/repositories/medical-record.repository";

jest.mock("../../../src/repositories/medications.repository");
jest.mock("../../../src/repositories/medical-record.repository");

const MedicationsRepositoryMock = MedicationsRepository as jest.MockedClass<
  typeof MedicationsRepository
>;
const MedicalRecordRepositoryMock = MedicalRecordRepository as jest.MockedClass<
  typeof MedicalRecordRepository
>;

const getMedicationsRepo = () =>
  MedicationsRepositoryMock.mock.instances[0] as jest.Mocked<MedicationsRepository>;
const getMedicalRecordRepo = () =>
  MedicalRecordRepositoryMock.mock.instances[0] as jest.Mocked<MedicalRecordRepository>;

describe("MedicationsService", () => {
  beforeEach(() => {
    const medicationsRepo = getMedicationsRepo();
    medicationsRepo.create?.mockReset();
    medicationsRepo.getForUser?.mockReset();
    medicationsRepo.getAllForUser?.mockReset();
    medicationsRepo.update?.mockReset();
    medicationsRepo.delete?.mockReset();

    const medicalRecordRepo = getMedicalRecordRepo();
    medicalRecordRepo.getRecordForUser?.mockReset();
    medicalRecordRepo.addItem?.mockReset();
    medicalRecordRepo.removeItemByRef?.mockReset();
  });

  it("should create medication, backfill diagnosis from record, and link it", async () => {
    const service = new MedicationsService();
    const medicationsRepo = getMedicationsRepo();
    const medicalRecordRepo = getMedicalRecordRepo();

    medicalRecordRepo.getRecordForUser.mockResolvedValue({
      _id: "r1",
      diagnosis: "Hypertension",
    } as any);
    medicationsRepo.create.mockResolvedValue({
      _id: "m1",
      userId: "u1",
      medicineName: "Amlodipine",
      diagnosis: "Hypertension",
      disease: "Hypertension",
    } as any);
    medicalRecordRepo.addItem.mockResolvedValue({ _id: "r1" } as any);

    const result = await service.createMedication("u1", {
      medicineName: "Amlodipine",
      recordId: "r1",
    } as any);

    expect(medicalRecordRepo.getRecordForUser).toHaveBeenCalledWith("r1", "u1");
    expect(medicationsRepo.create).toHaveBeenCalledWith({
      userId: "u1",
      medicineName: "Amlodipine",
      recordId: "r1",
      diagnosis: "Hypertension",
      disease: "Hypertension",
    });
    expect(medicalRecordRepo.addItem).toHaveBeenCalledWith("r1", "u1", {
      type: "medications",
      refId: "m1",
    });
    expect(result).toHaveProperty("_id", "m1");
  });

  it("should throw 404 when updating missing medication", async () => {
    const service = new MedicationsService();
    const medicationsRepo = getMedicationsRepo();

    medicationsRepo.getForUser.mockResolvedValue(null);

    await expect(
      service.updateMedication("u1", "missing", { dosage: "10mg" } as any),
    ).rejects.toHaveProperty("status", 404);
  });

  it("should delete medication and unlink from medical records", async () => {
    const service = new MedicationsService();
    const medicationsRepo = getMedicationsRepo();
    const medicalRecordRepo = getMedicalRecordRepo();

    medicationsRepo.getForUser.mockResolvedValue({ _id: "m1" } as any);
    medicationsRepo.delete.mockResolvedValue(true);
    medicalRecordRepo.removeItemByRef.mockResolvedValue(true);

    const result = await service.deleteMedication("u1", "m1");

    expect(result).toBe(true);
    expect(medicalRecordRepo.removeItemByRef).toHaveBeenCalledWith(
      "u1",
      "medications",
      "m1",
    );
  });
});
