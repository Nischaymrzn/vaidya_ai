import {
  predictDisease,
  predictHeartDisease,
  predictTuberculosis,
} from "@/lib/actions/prediction-action";
import {
  generateRiskAssessment,
  getLatestRiskAssessment,
  getRiskAssessments,
} from "@/lib/actions/risk-assessment-action";
import { getAnalyticsSummary } from "@/lib/actions/analytics-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("Prediction, risk and analytics actions integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("predicts disease and returns backend message", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Prediction ready",
        data: { disease: "Flu", confidence: 0.84 },
      },
    });

    const result = await predictDisease(["fever", "cough"]);

    expect(api.post).toHaveBeenCalledWith("/predict/symptom", {
      symptoms: ["fever", "cough"],
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Prediction ready");
  });

  it("predicts disease with fallback success message", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: { disease: "Common Cold", confidence: 0.62 },
      },
    });

    const result = await predictDisease(["runny nose"]);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Prediction generated");
  });

  it("maps backend disease prediction error message", async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Prediction service unavailable" } },
      message: "Request failed",
    });

    const result = await predictDisease(["fatigue"]);

    expect(result).toEqual({
      success: false,
      message: "Prediction service unavailable",
    });
  });

  it("predicts heart disease with provided payload", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { prediction: 0.72 } },
    });

    const payload = {
      gender: "male",
      smoking_history: "never",
      age: 39,
      bmi: 22.3,
      HbA1c_level: 5.2,
      blood_glucose_level: 95,
      hypertension: false,
      heart_disease: false,
    };
    const result = await predictHeartDisease(payload);

    expect(api.post).toHaveBeenCalledWith("/predict/heart-disease", payload);
    expect(result.success).toBe(true);
  });

  it("predicts tuberculosis with multipart headers", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { prediction: "Normal" } },
    });

    const formData = new FormData();
    formData.append("file", new Blob(["x-ray"], { type: "image/png" }), "xray.png");
    const result = await predictTuberculosis(formData);

    expect(api.post).toHaveBeenCalledWith("/predict/tuberculosis", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(result.success).toBe(true);
  });

  it("gets risk assessments and uses fallback success message", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [{ _id: "risk-1", riskLevel: "medium" }] },
    });

    const result = await getRiskAssessments();

    expect(api.get).toHaveBeenCalledWith("/risk-assessments");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Risk assessments fetched");
  });

  it("returns latest risk assessment as first list item", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          { _id: "risk-latest", riskLevel: "high" },
          { _id: "risk-older", riskLevel: "low" },
        ],
      },
    });

    const result = await getLatestRiskAssessment();

    expect(result?._id).toBe("risk-latest");
  });

  it("returns null when no risk assessment exists", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [] },
    });

    const result = await getLatestRiskAssessment();

    expect(result).toBeNull();
  });

  it("generates risk assessment with default empty payload", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Generated",
        data: { assessment: { _id: "risk-2", riskLevel: "low" } },
      },
    });

    const result = await generateRiskAssessment();

    expect(api.post).toHaveBeenCalledWith("/risk-assessments/generate", {});
    expect(result.success).toBe(true);
    expect(result.message).toBe("Generated");
  });

  it("maps analytics summary backend error message", async () => {
    (api.get as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Analytics service timeout" } },
      message: "Request failed",
    });

    const result = await getAnalyticsSummary({ months: 3 });

    expect(api.get).toHaveBeenCalledWith("/analytics/summary?months=3");
    expect(result).toEqual({
      success: false,
      message: "Analytics service timeout",
    });
  });
});

