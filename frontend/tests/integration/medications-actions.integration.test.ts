import { getMedications } from "@/lib/actions/medications-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
  },
}));

describe("Medications actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets medications without filters", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [{ _id: "m1", medicineName: "Metformin" }] },
    });

    const result = await getMedications();

    expect(api.get).toHaveBeenCalledWith("/medications");
    expect(result.success).toBe(true);
    expect(result.data?.[0].medicineName).toBe("Metformin");
  });

  it("gets medications with userId filter", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [{ _id: "m2", medicineName: "Aspirin" }] },
    });

    const result = await getMedications({ userId: "family member" });

    expect(api.get).toHaveBeenCalledWith("/medications?userId=family%20member");
    expect(result.success).toBe(true);
  });

  it("returns fallback error message on medications failure", async () => {
    (api.get as jest.Mock).mockRejectedValueOnce({
      message: "Network down",
    });

    const result = await getMedications();

    expect(result).toEqual({
      success: false,
      message: "Network down",
    });
  });
});

