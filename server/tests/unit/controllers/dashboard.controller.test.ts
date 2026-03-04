import { DashboardController } from "../../../src/controller/dashboard.controller";
import { DashboardService } from "../../../src/services/dashboard.service";

jest.mock("../../../src/services/dashboard.service");

const DashboardServiceMock = DashboardService as jest.MockedClass<
  typeof DashboardService
>;

const getService = () =>
  DashboardServiceMock.mock.instances[0] as jest.Mocked<DashboardService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("DashboardController", () => {
  beforeEach(() => {
    const service = getService();
    service.getSummary?.mockReset();
  });

  it("should return 401 when no user is attached", async () => {
    const controller = new DashboardController();
    const req: any = {};
    const res = mockRes();

    await controller.getSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return dashboard summary for authenticated user", async () => {
    const controller = new DashboardController();
    const service = getService();
    service.getSummary.mockResolvedValue({
      userName: "Test User",
      summaryCards: [],
      vitalsData: [],
      vitalStats: [],
      symptomData: [],
      symptomPattern: "No pattern",
      medications: [],
      allergies: [],
      clinicalItems: [],
      riskFactors: [],
      insights: [],
      timelineItems: [],
      healthScoreTrend: [],
      vaidyaScore: 75,
    } as any);

    const req: any = {
      user: {
        _id: "u1",
        name: "Test User",
      },
    };
    const res = mockRes();

    await controller.getSummary(req, res);

    expect(service.getSummary).toHaveBeenCalledWith("u1", "Test User");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Dashboard summary fetched",
      }),
    );
  });
});
