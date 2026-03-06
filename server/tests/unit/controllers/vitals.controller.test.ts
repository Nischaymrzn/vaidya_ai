import { VitalsController } from "../../../src/controller/vitals.controller";
import { VitalsService } from "../../../src/services/vitals.service";

jest.mock("../../../src/services/vitals.service");

const VitalsServiceMock = VitalsService as jest.MockedClass<typeof VitalsService>;

const getService = () =>
  VitalsServiceMock.mock.instances[0] as jest.Mocked<VitalsService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("VitalsController", () => {
  beforeEach(() => {
    const service = getService();
    service.getSummary?.mockReset();
    service.createVitals?.mockReset();
    service.getAllVitals?.mockReset();
    service.updateVitals?.mockReset();
    service.deleteVitals?.mockReset();
  });

  it("should return 401 for summary when user is not authenticated", async () => {
    const controller = new VitalsController();
    const req: any = {};
    const res = mockRes();

    await controller.getSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should create vitals and normalize empty recordedAt", async () => {
    const controller = new VitalsController();
    const service = getService();
    service.createVitals.mockResolvedValue({ _id: "v1" } as any);

    const req: any = {
      user: { id: "u1" },
      body: {
        heartRate: 80,
        recordedAt: "",
      },
    };
    const res = mockRes();

    await controller.createVitals(req, res);

    expect(service.createVitals).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        heartRate: 80,
      }),
    );
    expect(service.createVitals).toHaveBeenCalledWith(
      "u1",
      expect.not.objectContaining({
        recordedAt: "",
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 for invalid vitals payload", async () => {
    const controller = new VitalsController();
    const service = getService();
    const req: any = {
      user: { id: "u1" },
      body: {
        heartRate: -1,
      },
    };
    const res = mockRes();

    await controller.createVitals(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.createVitals).not.toHaveBeenCalled();
  });
});

