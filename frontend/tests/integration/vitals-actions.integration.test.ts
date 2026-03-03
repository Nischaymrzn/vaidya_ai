import {
  createVitals,
  deleteVitals,
  getVitals,
  getVitalsSummary,
  updateVitals,
} from "@/lib/actions/vitals-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Vitals actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets vitals list and normalizes data", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [{ _id: "v1", heartRate: 72 }] },
    });

    const result = await getVitals();

    expect(api.get).toHaveBeenCalledWith("/vitals");
    expect(result.success).toBe(true);
    expect(result.data?.[0]._id).toBe("v1");
  });

  it("gets vitals summary and uses backend message", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Summary fetched", data: { cards: [], trend: [], records: [] } },
    });

    const result = await getVitalsSummary();

    expect(api.get).toHaveBeenCalledWith("/vitals/summary");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Summary fetched");
  });

  it("creates vitals and returns normalized response", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Vitals created", data: { _id: "v2", heartRate: 80 } },
    });

    const result = await createVitals({ heartRate: 80 });

    expect(api.post).toHaveBeenCalledWith("/vitals", { heartRate: 80 });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Vitals created");
    expect(result.data?._id).toBe("v2");
  });

  it("updates vitals and returns normalized response", async () => {
    (api.patch as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Vitals updated", data: { _id: "v2", heartRate: 84 } },
    });

    const result = await updateVitals("v2", { heartRate: 84 });

    expect(api.patch).toHaveBeenCalledWith("/vitals/v2", { heartRate: 84 });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Vitals updated");
  });

  it("deletes vitals and returns backend message", async () => {
    (api.delete as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Vitals removed" },
    });

    const result = await deleteVitals("v2");

    expect(api.delete).toHaveBeenCalledWith("/vitals/v2");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Vitals removed");
  });
});
