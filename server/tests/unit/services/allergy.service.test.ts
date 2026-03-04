import { AllergyService } from "../../../src/services/allergy.service";
import { AllergyRepository } from "../../../src/repositories/allergy.repository";
import { MedicalRecordRepository } from "../../../src/repositories/medical-record.repository";
import { NotificationService } from "../../../src/services/notification.service";

jest.mock("../../../src/repositories/allergy.repository");
jest.mock("../../../src/repositories/medical-record.repository");
jest.mock("../../../src/services/notification.service");

const AllergyRepositoryMock = AllergyRepository as jest.MockedClass<
  typeof AllergyRepository
>;
const MedicalRecordRepositoryMock = MedicalRecordRepository as jest.MockedClass<
  typeof MedicalRecordRepository
>;
const NotificationServiceMock = NotificationService as jest.MockedClass<
  typeof NotificationService
>;

const getAllergyRepo = () =>
  AllergyRepositoryMock.mock.instances[0] as jest.Mocked<AllergyRepository>;
const getMedicalRecordRepo = () =>
  MedicalRecordRepositoryMock.mock.instances[0] as jest.Mocked<MedicalRecordRepository>;
const getNotificationService = () =>
  NotificationServiceMock.mock.instances[0] as jest.Mocked<NotificationService>;

describe("AllergyService", () => {
  beforeEach(() => {
    const allergyRepo = getAllergyRepo();
    allergyRepo.create?.mockReset();
    allergyRepo.getForUser?.mockReset();
    allergyRepo.getAllForUser?.mockReset();
    allergyRepo.update?.mockReset();
    allergyRepo.delete?.mockReset();

    const medicalRecordRepo = getMedicalRecordRepo();
    medicalRecordRepo.addItem?.mockReset();
    medicalRecordRepo.removeItemByRef?.mockReset();

    const notificationService = getNotificationService();
    notificationService.createNotification?.mockReset();
    notificationService.createNotification?.mockResolvedValue({} as any);
  });

  it("should create allergy, link medical record, and emit notification", async () => {
    const service = new AllergyService();
    const allergyRepo = getAllergyRepo();
    const medicalRecordRepo = getMedicalRecordRepo();
    const notificationService = getNotificationService();

    allergyRepo.create.mockResolvedValue({
      _id: "a1",
      allergen: "Peanuts",
      userId: "u1",
    } as any);
    medicalRecordRepo.addItem.mockResolvedValue({ _id: "r1" } as any);

    const result = await service.createAllergy("u1", {
      allergen: "Peanuts",
      recordId: "r1",
    } as any);

    expect(allergyRepo.create).toHaveBeenCalledWith({
      userId: "u1",
      allergen: "Peanuts",
      recordId: "r1",
    });
    expect(medicalRecordRepo.addItem).toHaveBeenCalledWith("r1", "u1", {
      type: "allergies",
      refId: "a1",
    });
    expect(notificationService.createNotification).toHaveBeenCalledWith("u1", {
      type: "allergy_added",
      title: "Allergy added",
      message: "Allergy recorded: Peanuts.",
      data: { allergyId: "a1" },
    });
    expect(result).toHaveProperty("_id", "a1");
  });

  it("should not fail create when notification throws", async () => {
    const service = new AllergyService();
    const allergyRepo = getAllergyRepo();
    const notificationService = getNotificationService();

    allergyRepo.create.mockResolvedValue({
      _id: "a2",
      allergen: "Dust",
      userId: "u1",
    } as any);
    notificationService.createNotification.mockRejectedValue(
      new Error("notification failed"),
    );

    await expect(
      service.createAllergy("u1", { allergen: "Dust" } as any),
    ).resolves.toHaveProperty("_id", "a2");
  });

  it("should delete allergy and unlink from medical records", async () => {
    const service = new AllergyService();
    const allergyRepo = getAllergyRepo();
    const medicalRecordRepo = getMedicalRecordRepo();

    allergyRepo.getForUser.mockResolvedValue({ _id: "a1" } as any);
    allergyRepo.delete.mockResolvedValue(true);
    medicalRecordRepo.removeItemByRef.mockResolvedValue(true);

    const result = await service.deleteAllergy("u1", "a1");

    expect(result).toBe(true);
    expect(medicalRecordRepo.removeItemByRef).toHaveBeenCalledWith(
      "u1",
      "allergies",
      "a1",
    );
  });
});
