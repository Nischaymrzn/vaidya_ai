import { DiseasePredictionController } from "../../../src/controller/disease-prediction.controller";
import {
  brainTumorPredictionService,
  diseasePredictionService,
  diabetesPredictionService,
  heartDiseasePredictionService,
  tuberculosisPredictionService,
} from "../../../src/services/disease-prediction.service";

jest.mock("../../../src/services/disease-prediction.service", () => ({
  brainTumorPredictionService: { predict: jest.fn() },
  tuberculosisPredictionService: { predict: jest.fn() },
  diabetesPredictionService: { predict: jest.fn() },
  heartDiseasePredictionService: { predict: jest.fn() },
  diseasePredictionService: { predict: jest.fn() },
}));

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("DiseasePredictionController", () => {
  beforeEach(() => {
    (brainTumorPredictionService.predict as jest.Mock).mockReset();
    (tuberculosisPredictionService.predict as jest.Mock).mockReset();
    (diabetesPredictionService.predict as jest.Mock).mockReset();
    (heartDiseasePredictionService.predict as jest.Mock).mockReset();
    (diseasePredictionService.predict as jest.Mock).mockReset();
  });

  it("should return 401 for brain tumor prediction when user is missing", async () => {
    const controller = new DiseasePredictionController();
    const req: any = { file: { buffer: Buffer.from("img") } };
    const res = mockRes();

    await controller.predictBrainTumor(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(brainTumorPredictionService.predict).not.toHaveBeenCalled();
  });

  it("should return 400 for brain tumor prediction when file is missing", async () => {
    const controller = new DiseasePredictionController();
    const req: any = { user: { _id: "u1" } };
    const res = mockRes();

    await controller.predictBrainTumor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(brainTumorPredictionService.predict).not.toHaveBeenCalled();
  });

  it("should return brain tumor prediction when valid request is provided", async () => {
    const controller = new DiseasePredictionController();
    (brainTumorPredictionService.predict as jest.Mock).mockResolvedValue({
      prediction: "Tumor",
      probability: 87.2,
      probabilities: [
        { label: "Non-Tumor", probability: 12.8 },
        { label: "Tumor", probability: 87.2 },
      ],
      insights: [],
    });

    const req: any = {
      user: { _id: "u1" },
      file: { buffer: Buffer.from("img") },
    };
    const res = mockRes();

    await controller.predictBrainTumor(req, res);

    expect(brainTumorPredictionService.predict).toHaveBeenCalledWith(
      "u1",
      expect.any(Buffer),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Brain tumor prediction generated",
      }),
    );
  });
});
