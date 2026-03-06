import {
  addFamilyMemberById,
  createFamilyGroup,
  createFamilyInvite,
  getFamilyGroupSummary,
  getMyFamilyGroup,
  joinFamilyInvite,
  updateFamilyMemberRelation,
} from "@/lib/actions/family-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("Family actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets my family group", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: { _id: "g1", name: "My Family", members: [] },
      },
    });

    const result = await getMyFamilyGroup();

    expect(api.get).toHaveBeenCalledWith("/family-groups/me");
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("My Family");
  });

  it("gets family summary", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          group: { _id: "g1", name: "My Family", adminId: "u1" },
          members: [],
          familyScore: 88,
        },
      },
    });

    const result = await getFamilyGroupSummary();

    expect(api.get).toHaveBeenCalledWith("/family-groups/me/summary");
    expect(result.success).toBe(true);
    expect(result.data?.familyScore).toBe(88);
  });

  it("creates family group", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { _id: "g2", name: "Parents" } },
    });

    const result = await createFamilyGroup({ name: "Parents" });

    expect(api.post).toHaveBeenCalledWith("/family-groups", { name: "Parents" });
    expect(result.success).toBe(true);
    expect(result.data?._id).toBe("g2");
  });

  it("creates family invite with default payload", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: { token: "invite-1", inviteLink: "http://app/join/invite-1" },
      },
    });

    const result = await createFamilyInvite("g1");

    expect(api.post).toHaveBeenCalledWith("/family-groups/g1/invitations", {});
    expect(result.success).toBe(true);
    expect(result.data?.token).toBe("invite-1");
  });

  it("adds member and updates relation", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { _id: "g1" } },
    });
    (api.patch as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { _id: "g1" } },
    });

    const addResult = await addFamilyMemberById("g1", {
      userId: "u2",
      relation: "Brother",
    });
    const updateResult = await updateFamilyMemberRelation("g1", "u2", {
      relation: "Sibling",
    });

    expect(api.post).toHaveBeenCalledWith("/family-groups/g1/members", {
      userId: "u2",
      relation: "Brother",
    });
    expect(api.patch).toHaveBeenCalledWith("/family-groups/g1/members/u2", {
      relation: "Sibling",
    });
    expect(addResult.success).toBe(true);
    expect(updateResult.success).toBe(true);
  });

  it("joins family invite and maps backend error", async () => {
    (api.post as jest.Mock)
      .mockResolvedValueOnce({
        data: { success: true, data: { _id: "g1", name: "Joined Family" } },
      })
      .mockRejectedValueOnce({
        response: { data: { message: "Invite expired" } },
        message: "Request failed",
      });

    const ok = await joinFamilyInvite("token-1", { relation: "Cousin" });
    const fail = await joinFamilyInvite("token-2");

    expect(api.post).toHaveBeenNthCalledWith(1, "/family-groups/join/token-1", {
      relation: "Cousin",
    });
    expect(api.post).toHaveBeenNthCalledWith(2, "/family-groups/join/token-2", {});
    expect(ok.success).toBe(true);
    expect(fail).toEqual({ success: false, message: "Invite expired" });
  });
});

