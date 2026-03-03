import {
  createAllergy,
  deleteAllergy,
  getAllergies,
  getAllergyById,
  updateAllergy,
} from "@/lib/actions/allergy-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("Allergy actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets allergy list with user filter", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [{ _id: "a1", allergen: "Pollen" }] },
    });

    const result = await getAllergies({ userId: "u1" });

    expect(api.get).toHaveBeenCalledWith("/allergies?userId=u1");
    expect(result.success).toBe(true);
    expect(result.data?.[0].allergen).toBe("Pollen");
  });

  it("gets allergy by id", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { _id: "a1", allergen: "Dust" } },
    });

    const result = await getAllergyById("a1");

    expect(api.get).toHaveBeenCalledWith("/allergies/a1");
    expect(result.success).toBe(true);
    expect(result.data?._id).toBe("a1");
  });

  it("creates allergy and returns normalized success message", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Allergy created", data: { _id: "a2", allergen: "Peanut" } },
    });

    const result = await createAllergy({ allergen: "Peanut" });

    expect(api.post).toHaveBeenCalledWith("/allergies", { allergen: "Peanut" });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Allergy created");
  });

  it("updates allergy and returns normalized success message", async () => {
    (api.patch as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Allergy updated", data: { _id: "a2", status: "resolved" } },
    });

    const result = await updateAllergy("a2", { status: "resolved" });

    expect(api.patch).toHaveBeenCalledWith("/allergies/a2", { status: "resolved" });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Allergy updated");
  });

  it("returns backend error on delete failure", async () => {
    (api.delete as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Delete failed" } },
      message: "Request failed",
    });

    const result = await deleteAllergy("a2");

    expect(api.delete).toHaveBeenCalledWith("/allergies/a2");
    expect(result).toEqual({ success: false, message: "Delete failed" });
  });
});

