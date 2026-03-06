import { getHealthInsights } from "@/lib/actions/health-insight-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
  },
}));

describe("Health insight actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets health insights without risk id", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [{ _id: "h1", title: "Hydration alert" }] },
    });

    const result = await getHealthInsights();

    expect(api.get).toHaveBeenCalledWith("/health-insights");
    expect(result.success).toBe(true);
    expect(result.data?.[0]._id).toBe("h1");
  });

  it("gets health insights with risk id filter", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [{ _id: "h2", riskId: "r1" }] },
    });

    const result = await getHealthInsights("r1");

    expect(api.get).toHaveBeenCalledWith("/health-insights?riskId=r1");
    expect(result.success).toBe(true);
  });

  it("returns fallback error message on request failure", async () => {
    (api.get as jest.Mock).mockRejectedValueOnce({
      message: "Network timeout",
    });

    const result = await getHealthInsights("r2");

    expect(result).toEqual({
      success: false,
      message: "Network timeout",
    });
  });
});

