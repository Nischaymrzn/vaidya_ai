import { MedicalRecordController } from "../../../src/controller/medical-record.controller";
import { MedicalRecordService } from "../../../src/services/medical-record.service";

jest.mock("../../../src/services/medical-record.service");
jest.mock("../../../src/utils/cloudinary", () => ({
  uploadFileBuffer: jest.fn(),
}));

const MedicalRecordServiceMock = MedicalRecordService as jest.MockedClass<
  typeof MedicalRecordService
>;

const getService = () =>
  MedicalRecordServiceMock.mock.instances[0] as jest.Mocked<MedicalRecordService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("MedicalRecordController", () => {
  beforeEach(() => {
    const service = getService();
    service.createRecord?.mockReset();
    service.getAllRecords?.mockReset();
    service.getRecordById?.mockReset();
    service.updateRecord?.mockReset();
    service.deleteRecord?.mockReset();
  });

  it("should return 401 when creating record without auth user", async () => {
    const controller = new MedicalRecordController();
    const req: any = { body: { title: "Record" } };
    const res = mockRes();

    await controller.createRecord(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should normalize date field and create record", async () => {
    const controller = new MedicalRecordController();
    const service = getService();
    service.createRecord.mockResolvedValue({ _id: "r1" } as any);

    const req: any = {
      user: { id: "u1" },
      body: {
        title: "Annual checkup",
        date: "2026-01-01",
      },
    };
    const res = mockRes();

    await controller.createRecord(req, res);

    expect(service.createRecord).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        title: "Annual checkup",
        recordDate: expect.any(Date),
        attachments: [],
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should parse list query params and pass target user id", async () => {
    const controller = new MedicalRecordController();
    const service = getService();
    service.getAllRecords.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    } as any);

    const req: any = {
      user: { id: "admin-1" },
      query: { page: "2", limit: "5", userId: "member-1" },
    };
    const res = mockRes();

    await controller.getAllRecords(req, res);

    expect(service.getAllRecords).toHaveBeenCalledWith(
      "admin-1",
      { page: 2, limit: 5 },
      "member-1",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

