import { MedicalRecordService } from "../../../src/services/medical-record.service";
import { MedicalRecordRepository } from "../../../src/repositories/medical-record.repository";
import { FamilyGroupRepository } from "../../../src/repositories/family-group.repository";
import { NotificationService } from "../../../src/services/notification.service";

jest.mock("../../../src/repositories/medical-record.repository");
jest.mock("../../../src/repositories/family-group.repository");
jest.mock("../../../src/services/vitals.service");
jest.mock("../../../src/services/symptoms.service");
jest.mock("../../../src/services/medications.service");
jest.mock("../../../src/services/medical-file.service");
jest.mock("../../../src/services/allergy.service");
jest.mock("../../../src/services/immunization.service");
jest.mock("../../../src/services/notification.service");

const MedicalRecordRepositoryMock = MedicalRecordRepository as jest.MockedClass<
  typeof MedicalRecordRepository
>;
const FamilyGroupRepositoryMock = FamilyGroupRepository as jest.MockedClass<
  typeof FamilyGroupRepository
>;
const NotificationServiceMock = NotificationService as jest.MockedClass<
  typeof NotificationService
>;

const getMedicalRecordRepo = () =>
  MedicalRecordRepositoryMock.mock.instances[0] as jest.Mocked<MedicalRecordRepository>;
const getFamilyGroupRepo = () =>
  FamilyGroupRepositoryMock.mock.instances[0] as jest.Mocked<FamilyGroupRepository>;
const getNotificationService = () =>
  NotificationServiceMock.mock.instances[0] as jest.Mocked<NotificationService>;

describe("MedicalRecordService", () => {
  beforeEach(() => {
    const medicalRecordRepo = getMedicalRecordRepo();
    medicalRecordRepo.createRecord?.mockReset();
    medicalRecordRepo.getRecordForUser?.mockReset();
    medicalRecordRepo.getAllForUser?.mockReset();
    medicalRecordRepo.updateRecord?.mockReset();
    medicalRecordRepo.deleteRecord?.mockReset();

    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findByMemberId?.mockReset();

    const notificationService = getNotificationService();
    notificationService.createNotification?.mockReset();
    notificationService.createNotification?.mockResolvedValue({} as any);
  });

  it("should create a medical record and return saved data", async () => {
    const service = new MedicalRecordService();
    const medicalRecordRepo = getMedicalRecordRepo();
    const notificationService = getNotificationService();

    medicalRecordRepo.createRecord.mockResolvedValue({
      _id: "rec-1",
      userId: "u1",
      title: "Annual checkup",
      recordType: "Visit",
    } as any);
    medicalRecordRepo.getRecordForUser.mockResolvedValue({
      _id: "rec-1",
      userId: "u1",
      title: "Annual checkup",
      recordType: "Visit",
    } as any);

    const result = await service.createRecord("u1", {
      title: "Annual checkup",
      recordType: "Visit",
    } as any);

    expect(medicalRecordRepo.createRecord).toHaveBeenCalledWith({
      userId: "u1",
      title: "Annual checkup",
      recordType: "Visit",
      attachments: undefined,
    });
    expect(notificationService.createNotification).toHaveBeenCalledWith("u1", {
      type: "record_created",
      title: "Record added",
      message: "Visit created successfully.",
      data: { recordId: "rec-1", recordType: "Visit" },
    });
    expect(result).toHaveProperty("_id", "rec-1");
  });

  it("should fetch records for current user when target user is not provided", async () => {
    const service = new MedicalRecordService();
    const medicalRecordRepo = getMedicalRecordRepo();
    const familyGroupRepo = getFamilyGroupRepo();

    medicalRecordRepo.getAllForUser.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });

    await service.getAllRecords("u1", { page: 1, limit: 10 });

    expect(medicalRecordRepo.getAllForUser).toHaveBeenCalledWith("u1", {
      page: 1,
      limit: 10,
    });
    expect(familyGroupRepo.findByMemberId).not.toHaveBeenCalled();
  });

  it("should allow family admin to read member records by target user id", async () => {
    const service = new MedicalRecordService();
    const medicalRecordRepo = getMedicalRecordRepo();
    const familyGroupRepo = getFamilyGroupRepo();

    familyGroupRepo.findByMemberId.mockResolvedValue({
      _id: "g1",
      adminId: "u1",
      members: [
        { userId: "u1", role: "admin" },
        { userId: "u2", role: "member" },
      ],
    } as any);
    medicalRecordRepo.getAllForUser.mockResolvedValue({
      data: [{ _id: "rec-2" }],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    } as any);

    const result = await service.getAllRecords("u1", { page: 1, limit: 10 }, "u2");

    expect(medicalRecordRepo.getAllForUser).toHaveBeenCalledWith("u2", {
      page: 1,
      limit: 10,
    });
    expect(result.data).toHaveLength(1);
  });

  it("should reject member trying to read another family member records", async () => {
    const service = new MedicalRecordService();
    const familyGroupRepo = getFamilyGroupRepo();

    familyGroupRepo.findByMemberId.mockResolvedValue({
      _id: "g1",
      adminId: "u-admin",
      members: [
        { userId: "u1", role: "member" },
        { userId: "u2", role: "member" },
      ],
    } as any);

    await expect(
      service.getAllRecords("u1", { page: 1, limit: 10 }, "u2"),
    ).rejects.toHaveProperty("status", 403);
  });
});
