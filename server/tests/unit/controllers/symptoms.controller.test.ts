import { SymptomsController } from "../../../src/controller/symptoms.controller";
import { SymptomsService } from "../../../src/services/symptoms.service";

jest.mock("../../../src/services/symptoms.service");

const SymptomsServiceMock = SymptomsService as jest.MockedClass<
  typeof SymptomsService
>;

const getService = () =>
  SymptomsServiceMock.mock.instances[0] as jest.Mocked<SymptomsService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("SymptomsController", () => {
  beforeEach(() => {
    const service = getService();
    service.createSymptoms?.mockReset();
    service.getAllSymptoms?.mockReset();
    service.updateSymptoms?.mockReset();
    service.deleteSymptoms?.mockReset();
  });

  it("should return 401 when user is not authenticated", async () => {
    const controller = new SymptomsController();
    const req: any = { body: {} };
    const res = mockRes();

    await controller.createSymptoms(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
    });
  });

  it("should normalize comma-separated symptomList and create symptoms", async () => {
    const controller = new SymptomsController();
    const service = getService();
    service.createSymptoms.mockResolvedValue({ _id: "s1" } as any);

    const req: any = {
      user: { id: "u1" },
      body: {
        symptomList: "Headache, Fatigue",
        status: "ongoing",
      },
    };
    const res = mockRes();

    await controller.createSymptoms(req, res);

    expect(service.createSymptoms).toHaveBeenCalledWith("u1", {
      symptomList: ["Headache", "Fatigue"],
      status: "ongoing",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 for invalid payload", async () => {
    const controller = new SymptomsController();
    const service = getService();
    const req: any = {
      user: { id: "u1" },
      body: {
        status: "bad-status",
      },
    };
    const res = mockRes();

    await controller.createSymptoms(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.createSymptoms).not.toHaveBeenCalled();
  });
});

