import { RiskAssessmentController } from "../../../src/controller/risk-assessment.controller";
import { RiskAssessmentService } from "../../../src/services/risk-assessment.service";

jest.mock("../../../src/services/risk-assessment.service");

const RiskAssessmentServiceMock = RiskAssessmentService as jest.MockedClass<
  typeof RiskAssessmentService
>;

const getService = () =>
  RiskAssessmentServiceMock.mock.instances[0] as jest.Mocked<RiskAssessmentService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("RiskAssessmentController", () => {
  beforeEach(() => {
    const service = getService();
    service.generateAssessment?.mockReset();
    service.getAssessments?.mockReset();
    service.getAssessmentById?.mockReset();
  });

  it("should return 401 when generating assessment without auth user", async () => {
    const controller = new RiskAssessmentController();
    const req: any = { body: { includeAi: false } };
    const res = mockRes();

    await controller.generate(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 400 for invalid generate payload", async () => {
    const controller = new RiskAssessmentController();
    const req: any = {
      user: { _id: "u1" },
      body: { maxInsights: 99 },
    };
    const res = mockRes();

    await controller.generate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should generate risk assessment and return 201", async () => {
    const controller = new RiskAssessmentController();
    const service = getService();
    service.generateAssessment.mockResolvedValue({
      assessment: { _id: "r1" },
      insights: [],
    } as any);

    const req: any = {
      user: { _id: "u1" },
      body: { includeAi: false, useLatest: true, maxInsights: 3 },
    };
    const res = mockRes();

    await controller.generate(req, res);

    expect(service.generateAssessment).toHaveBeenCalledWith("u1", {
      includeAi: false,
      useLatest: true,
      maxInsights: 3,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should fetch user assessments and single assessment by id", async () => {
    const controller = new RiskAssessmentController();
    const service = getService();
    service.getAssessments.mockResolvedValue([{ _id: "r1" }] as any);
    service.getAssessmentById.mockResolvedValue({
      assessment: { _id: "r1" },
      insights: [],
      sources: { vitalsIds: [], symptomsIds: [] },
    } as any);

    const listReq: any = { user: { _id: "u1" } };
    const listRes = mockRes();
    await controller.getAssessments(listReq, listRes);
    expect(listRes.status).toHaveBeenCalledWith(200);
    expect(service.getAssessments).toHaveBeenCalledWith("u1");

    const singleReq: any = { user: { _id: "u1" }, params: { id: "r1" } };
    const singleRes = mockRes();
    await controller.getAssessmentById(singleReq, singleRes);
    expect(singleRes.status).toHaveBeenCalledWith(200);
    expect(service.getAssessmentById).toHaveBeenCalledWith("u1", "r1");
  });
});
