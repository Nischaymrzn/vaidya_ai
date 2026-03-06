import {
  createSymptom,
  deleteSymptom,
  getSymptoms,
  updateSymptom,
} from "@/lib/actions/symptoms-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Symptoms actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets symptoms and normalizes nested data", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ _id: "s1", symptomList: ["cough"], severity: "mild" }],
      },
    });

    const result = await getSymptoms();

    expect(api.get).toHaveBeenCalledWith("/symptoms");
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0]._id).toBe("s1");
  });

  it("creates symptom and returns normalized message", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { _id: "s2", severity: "moderate" } },
    });

    const result = await createSymptom({
      symptomList: ["fever"],
      severity: "moderate",
    });

    expect(api.post).toHaveBeenCalledWith("/symptoms", {
      symptomList: ["fever"],
      severity: "moderate",
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Symptom added successfully");
    expect(result.data?._id).toBe("s2");
  });

  it("updates symptom and returns normalized message", async () => {
    (api.patch as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { _id: "s1", severity: "severe" } },
    });

    const result = await updateSymptom("s1", { severity: "severe" });

    expect(api.patch).toHaveBeenCalledWith("/symptoms/s1", { severity: "severe" });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Symptom updated successfully");
    expect(result.data?.severity).toBe("severe");
  });

  it("deletes symptom and returns normalized success response", async () => {
    (api.delete as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

    const result = await deleteSymptom("s1");

    expect(api.delete).toHaveBeenCalledWith("/symptoms/s1");
    expect(result).toEqual({
      success: true,
      message: "Symptom deleted successfully",
    });
  });

  it("returns backend error on create failure", async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Unable to create symptom" } },
      message: "Request failed",
    });

    const result = await createSymptom({
      symptomList: ["cold"],
      severity: "mild",
    });

    expect(result).toEqual({
      success: false,
      message: "Unable to create symptom",
    });
  });
});

