import { BrainTumorPredictionService } from "../../../src/services/disease-prediction.service";
import { HealthInsightRepository } from "../../../src/repositories/health-insight.repository";

jest.mock("../../../src/repositories/health-insight.repository");
jest.mock("../../../src/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const HealthInsightRepositoryMock = HealthInsightRepository as jest.MockedClass<
  typeof HealthInsightRepository
>;

const getHealthInsightRepo = () =>
  HealthInsightRepositoryMock.mock.instances[0] as jest.Mocked<HealthInsightRepository>;

describe("BrainTumorPredictionService", () => {
  beforeEach(() => {
    const repo = getHealthInsightRepo();
    repo.deleteByContext?.mockReset();
    repo.createMany?.mockReset();
    repo.deleteByContext?.mockResolvedValue(true);
    repo.createMany?.mockResolvedValue([] as any);
  });

  it("should normalize class label map from class_labels.json-style object", () => {
    const service = new BrainTumorPredictionService() as any;
    const labels = service.normalizeLabelClasses({
      "1": "Tumor",
      "0": "Non-Tumor",
    });

    expect(labels).toEqual(["Non-Tumor", "Tumor"]);
  });

  it("should throw when labels are not loaded", async () => {
    const service = new BrainTumorPredictionService() as any;
    service.init = jest.fn().mockResolvedValue(undefined);
    service.session = {
      inputNames: ["input"],
      run: jest.fn().mockResolvedValue({
        output: { data: Float32Array.from([0.1, 0.9]) },
      }),
    };
    service.labelClasses = [];

    await expect(
      service.predict("u1", Buffer.from("brain-image")),
    ).rejects.toThrow("Brain tumor labels not available");
  });

  it("should predict brain tumor probabilities and persist insights", async () => {
    const service = new BrainTumorPredictionService() as any;
    const healthInsightRepo = getHealthInsightRepo();

    service.init = jest.fn().mockResolvedValue(undefined);
    service.session = {
      inputNames: ["input"],
      run: jest.fn().mockResolvedValue({
        output: { data: Float32Array.from([0.2, 0.8]) },
      }),
    };
    service.labelClasses = ["Non-Tumor", "Tumor"];
    service.preprocessImage = jest
      .fn()
      .mockResolvedValue(Float32Array.from([0, 1, 2, 3]));
    service.buildInputTensor = jest
      .fn()
      .mockReturnValue({ inputName: "input", tensor: {} });

    const result = await service.predict("u1", Buffer.from("brain-image"));

    expect(result.prediction).toBe("Tumor");
    expect(result.probability).toBe(80);
    expect(result.probabilities).toEqual([
      { label: "Non-Tumor", probability: 20 },
      { label: "Tumor", probability: 80 },
    ]);
    expect(result.insights.length).toBeGreaterThan(0);

    expect(healthInsightRepo.deleteByContext).toHaveBeenCalledWith(
      "u1",
      "brain_tumor_prediction",
      expect.any(String),
    );
    expect(healthInsightRepo.createMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          userId: "u1",
          contextType: "brain_tumor_prediction",
        }),
      ]),
    );
  });

  it("should return prediction even if insight persistence fails", async () => {
    const service = new BrainTumorPredictionService() as any;
    const healthInsightRepo = getHealthInsightRepo();
    healthInsightRepo.deleteByContext.mockRejectedValue(new Error("db error"));

    service.init = jest.fn().mockResolvedValue(undefined);
    service.session = {
      inputNames: ["input"],
      run: jest.fn().mockResolvedValue({
        output: { data: Float32Array.from([0.9, 0.1]) },
      }),
    };
    service.labelClasses = ["Non-Tumor", "Tumor"];
    service.preprocessImage = jest
      .fn()
      .mockResolvedValue(Float32Array.from([0, 1, 2, 3]));
    service.buildInputTensor = jest
      .fn()
      .mockReturnValue({ inputName: "input", tensor: {} });

    const result = await service.predict("u1", Buffer.from("brain-image"));

    expect(result.prediction).toBe("Non-Tumor");
    expect(result.probability).toBe(90);
    expect(result.insights.length).toBeGreaterThan(0);
  });
});
