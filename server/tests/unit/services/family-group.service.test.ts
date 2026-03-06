import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { env } from "../../../src/config/env";

const familyGroupRepoMock = {
  findByMemberId: jest.fn(),
  findById: jest.fn(),
  findByIdWithMembers: jest.fn(),
  create: jest.fn(),
  addMember: jest.fn(),
  updateMemberRelation: jest.fn(),
  updateScore: jest.fn(),
};
const familyInviteRepoMock = {
  findByToken: jest.fn(),
  create: jest.fn(),
  markUsed: jest.fn(),
};
const userRepoMock = {
  getUserById: jest.fn(),
};
const userDataRepoMock = {
  getByUserIds: jest.fn(),
};
const vitalsRepoMock = {
  getAllForUser: jest.fn(),
};

jest.mock("../../../src/repositories/family-group.repository", () => ({
  FamilyGroupRepository: jest.fn().mockImplementation(() => familyGroupRepoMock),
}));
jest.mock("../../../src/repositories/family-invite.repository", () => ({
  FamilyInviteRepository: jest.fn().mockImplementation(() => familyInviteRepoMock),
}));
jest.mock("../../../src/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => userRepoMock),
}));
jest.mock("../../../src/repositories/user-data.repository", () => ({
  UserDataRepository: jest.fn().mockImplementation(() => userDataRepoMock),
}));
jest.mock("../../../src/repositories/vitals.repository", () => ({
  VitalsRepository: jest.fn().mockImplementation(() => vitalsRepoMock),
}));

const { FamilyGroupService } = require("../../../src/services/family-group.service") as {
  FamilyGroupService: new () => any;
};
const getFamilyGroupRepo = () => familyGroupRepoMock as any;
const getFamilyInviteRepo = () => familyInviteRepoMock as any;
const getUserRepo = () => userRepoMock as any;
const getUserDataRepo = () => userDataRepoMock as any;
const getVitalsRepo = () => vitalsRepoMock as any;

describe("FamilyGroupService", () => {
  const adminId = "507f1f77bcf86cd799439011";
  const memberId = "507f1f77bcf86cd799439012";
  const anotherId = "507f1f77bcf86cd799439014";
  const groupId = "507f1f77bcf86cd799439013";
  const otherGroupId = "507f1f77bcf86cd799439015";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    env.CLIENT_URL = "http://localhost:3000";

    const familyGroupRepo = getFamilyGroupRepo();
    const familyInviteRepo = getFamilyInviteRepo();
    const userRepo = getUserRepo();
    const userDataRepo = getUserDataRepo();
    const vitalsRepo = getVitalsRepo();

    familyGroupRepo.findByMemberId?.mockReset();
    familyGroupRepo.findById?.mockReset();
    familyGroupRepo.findByIdWithMembers?.mockReset();
    familyGroupRepo.create?.mockReset();
    familyGroupRepo.addMember?.mockReset();
    familyGroupRepo.updateMemberRelation?.mockReset();
    familyGroupRepo.updateScore?.mockReset();

    familyInviteRepo.findByToken?.mockReset();
    familyInviteRepo.create?.mockReset();
    familyInviteRepo.markUsed?.mockReset();

    userRepo.getUserById?.mockReset();
    userDataRepo.getByUserIds?.mockReset();
    vitalsRepo.getAllForUser?.mockReset();

    userDataRepo.getByUserIds.mockResolvedValue([]);
    vitalsRepo.getAllForUser.mockResolvedValue([]);
    familyGroupRepo.updateScore.mockResolvedValue({ _id: groupId } as any);
  });

  it("throws when fetching group for user not in any family", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findByMemberId.mockResolvedValue(null);

    await expect(service.getFamilyGroupForUser(adminId)).rejects.toHaveProperty(
      "status",
      StatusCodes.NOT_FOUND,
    );
  });

  it("returns hydrated family group for valid member", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findByMemberId.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    familyGroupRepo.findByIdWithMembers.mockResolvedValue({
      _id: groupId,
      name: "My Family",
      members: [{ userId: adminId, role: "admin" }],
    } as any);

    const result = await service.getFamilyGroupForUser(adminId);

    expect(result).toHaveProperty("name", "My Family");
    expect(familyGroupRepo.updateScore).toHaveBeenCalled();
  });

  it("rejects creating family when user already has one", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findByMemberId.mockResolvedValue({ _id: groupId } as any);

    await expect(service.createFamilyGroup(adminId, "Family")).rejects.toHaveProperty(
      "status",
      StatusCodes.CONFLICT,
    );
  });

  it("rejects creating family for non-existent user", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const userRepo = getUserRepo();
    familyGroupRepo.findByMemberId.mockResolvedValue(null);
    userRepo.getUserById.mockResolvedValue(null);

    await expect(service.createFamilyGroup(adminId, "Family")).rejects.toHaveProperty(
      "status",
      StatusCodes.NOT_FOUND,
    );
  });

  it("creates family with creator as admin/self member", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const userRepo = getUserRepo();
    familyGroupRepo.findByMemberId.mockResolvedValue(null);
    userRepo.getUserById.mockResolvedValue({ _id: adminId } as any);
    familyGroupRepo.create.mockResolvedValue({
      _id: groupId,
      toObject: () => ({ _id: groupId, name: "Family A" }),
    } as any);
    familyGroupRepo.findByIdWithMembers.mockResolvedValue({
      _id: groupId,
      name: "Family A",
      members: [{ userId: adminId, role: "admin", relation: "self" }],
    } as any);

    const result = await service.createFamilyGroup(adminId, "Family A");

    expect(familyGroupRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Family A",
        score: 0,
        members: [
          expect.objectContaining({
            role: "admin",
            relation: "self",
          }),
        ],
      }),
    );
    expect(result).toHaveProperty("name", "Family A");
  });

  it("rejects invite creation when group does not exist", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue(null);

    await expect(service.createInvite(groupId, adminId)).rejects.toHaveProperty(
      "status",
      StatusCodes.NOT_FOUND,
    );
  });

  it("rejects invite creation for non-admin member", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId: anotherId,
      members: [{ userId: memberId, role: "member" }],
    } as any);

    await expect(service.createInvite(groupId, memberId)).rejects.toHaveProperty(
      "status",
      StatusCodes.FORBIDDEN,
    );
  });

  it("creates invite with default expiry and valid link", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const familyInviteRepo = getFamilyInviteRepo();
    jest.spyOn(crypto, "randomBytes").mockImplementation(
      ((size: number) => Buffer.alloc(size, 7)) as any,
    );
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    familyInviteRepo.create.mockResolvedValue({ token: "x" } as any);

    const result = await service.createInvite(groupId, adminId);

    expect(result.token).toHaveLength(48);
    expect(result.inviteLink).toContain("/family-health/join?token=");
    expect(familyInviteRepo.create).toHaveBeenCalled();
  });

  it("creates invite with custom expiry days", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const familyInviteRepo = getFamilyInviteRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    familyInviteRepo.create.mockResolvedValue({ token: "x" } as any);

    const result = await service.createInvite(groupId, adminId, 2);

    const deltaMs = result.expiresAt.getTime() - Date.now();
    expect(deltaMs).toBeGreaterThan(24 * 60 * 60 * 1000);
    expect(deltaMs).toBeLessThan(3 * 24 * 60 * 60 * 1000);
  });

  it("rejects addMember when group does not exist", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue(null);

    await expect(
      service.addMemberByUserId(groupId, adminId, memberId, "brother"),
    ).rejects.toHaveProperty("status", StatusCodes.NOT_FOUND);
  });

  it("rejects addMember for non-admin caller", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId: anotherId,
      members: [{ userId: memberId, role: "member" }],
    } as any);

    await expect(
      service.addMemberByUserId(groupId, memberId, anotherId),
    ).rejects.toHaveProperty("status", StatusCodes.FORBIDDEN);
  });

  it("rejects addMember when target user does not exist", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const userRepo = getUserRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    userRepo.getUserById.mockResolvedValue(null);

    await expect(
      service.addMemberByUserId(groupId, adminId, memberId),
    ).rejects.toHaveProperty("status", StatusCodes.NOT_FOUND);
  });

  it("rejects addMember when target already belongs to another group", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const userRepo = getUserRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    userRepo.getUserById.mockResolvedValue({ _id: memberId } as any);
    familyGroupRepo.findByMemberId.mockResolvedValue({ _id: otherGroupId } as any);

    await expect(
      service.addMemberByUserId(groupId, adminId, memberId),
    ).rejects.toHaveProperty("status", StatusCodes.CONFLICT);
  });

  it("rejects addMember when user is already in the same group", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const userRepo = getUserRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [
        { userId: adminId, role: "admin" },
        { userId: memberId, role: "member" },
      ],
    } as any);
    userRepo.getUserById.mockResolvedValue({ _id: memberId } as any);
    familyGroupRepo.findByMemberId.mockResolvedValue({ _id: groupId } as any);

    await expect(
      service.addMemberByUserId(groupId, adminId, memberId),
    ).rejects.toHaveProperty("status", StatusCodes.CONFLICT);
  });

  it("rejects addMember when repository update returns null", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const userRepo = getUserRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    userRepo.getUserById.mockResolvedValue({ _id: memberId } as any);
    familyGroupRepo.findByMemberId.mockResolvedValue(null);
    familyGroupRepo.addMember.mockResolvedValue(null);

    await expect(
      service.addMemberByUserId(groupId, adminId, memberId),
    ).rejects.toHaveProperty("status", StatusCodes.NOT_FOUND);
  });

  it("adds member successfully and returns populated group", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    const userRepo = getUserRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    userRepo.getUserById.mockResolvedValue({ _id: memberId } as any);
    familyGroupRepo.findByMemberId.mockResolvedValue(null);
    familyGroupRepo.addMember.mockResolvedValue({
      _id: groupId,
      members: [{ userId: adminId }, { userId: memberId }],
    } as any);
    familyGroupRepo.findByIdWithMembers.mockResolvedValue({
      _id: groupId,
      name: "Family Plus",
      members: [{ userId: adminId }, { userId: memberId }],
    } as any);

    const result = await service.addMemberByUserId(
      groupId,
      adminId,
      memberId,
      "sibling",
    );

    expect(familyGroupRepo.addMember).toHaveBeenCalled();
    expect(familyGroupRepo.updateScore).toHaveBeenCalled();
    expect(result).toHaveProperty("name", "Family Plus");
  });

  it("rejects updateMemberRelation when group does not exist", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue(null);

    await expect(
      service.updateMemberRelation(groupId, adminId, memberId, "brother"),
    ).rejects.toHaveProperty("status", StatusCodes.NOT_FOUND);
  });

  it("rejects updateMemberRelation for non-admin user", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId: anotherId,
      members: [{ userId: adminId, role: "member" }],
    } as any);

    await expect(
      service.updateMemberRelation(groupId, adminId, memberId, "brother"),
    ).rejects.toHaveProperty("status", StatusCodes.FORBIDDEN);
  });

  it("rejects updateMemberRelation when target member does not exist", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    familyGroupRepo.updateMemberRelation.mockResolvedValue(null);

    await expect(
      service.updateMemberRelation(groupId, adminId, memberId, "brother"),
    ).rejects.toHaveProperty("status", StatusCodes.NOT_FOUND);
  });

  it("updates relation after trimming whitespace", async () => {
    const service = new FamilyGroupService();
    const familyGroupRepo = getFamilyGroupRepo();
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    familyGroupRepo.updateMemberRelation.mockResolvedValue({
      _id: groupId,
      members: [{ userId: memberId, relation: "brother" }],
    } as any);
    familyGroupRepo.findByIdWithMembers.mockResolvedValue({
      _id: groupId,
      members: [{ userId: memberId, relation: "brother" }],
    } as any);

    await service.updateMemberRelation(groupId, adminId, memberId, "  brother  ");

    expect(familyGroupRepo.updateMemberRelation).toHaveBeenCalledWith(
      groupId,
      memberId,
      "brother",
    );
  });

  it("rejects joinWithInvite for unknown token", async () => {
    const service = new FamilyGroupService();
    const familyInviteRepo = getFamilyInviteRepo();
    familyInviteRepo.findByToken.mockResolvedValue(null);

    await expect(service.joinWithInvite("token-x", memberId)).rejects.toHaveProperty(
      "status",
      StatusCodes.NOT_FOUND,
    );
  });

  it("rejects joinWithInvite for already used invite", async () => {
    const service = new FamilyGroupService();
    const familyInviteRepo = getFamilyInviteRepo();
    familyInviteRepo.findByToken.mockResolvedValue({
      token: "token-y",
      usedAt: new Date(),
    } as any);

    await expect(service.joinWithInvite("token-y", memberId)).rejects.toHaveProperty(
      "status",
      StatusCodes.GONE,
    );
  });

  it("rejects joinWithInvite for expired invite", async () => {
    const service = new FamilyGroupService();
    const familyInviteRepo = getFamilyInviteRepo();
    familyInviteRepo.findByToken.mockResolvedValue({
      token: "token-z",
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
    } as any);

    await expect(service.joinWithInvite("token-z", memberId)).rejects.toHaveProperty(
      "status",
      StatusCodes.GONE,
    );
  });

  it("rejects joinWithInvite when target family group is missing", async () => {
    const service = new FamilyGroupService();
    const familyInviteRepo = getFamilyInviteRepo();
    const familyGroupRepo = getFamilyGroupRepo();
    familyInviteRepo.findByToken.mockResolvedValue({
      token: "token-a",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      groupId,
      invitedBy: adminId,
    } as any);
    familyGroupRepo.findById.mockResolvedValue(null);

    await expect(service.joinWithInvite("token-a", memberId)).rejects.toHaveProperty(
      "status",
      StatusCodes.NOT_FOUND,
    );
  });

  it("joins with invite, adds member, marks invite used and returns populated group", async () => {
    const service = new FamilyGroupService();
    const familyInviteRepo = getFamilyInviteRepo();
    const familyGroupRepo = getFamilyGroupRepo();

    familyInviteRepo.findByToken.mockResolvedValue({
      token: "token-ok",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      groupId,
      invitedBy: adminId,
    } as any);
    familyGroupRepo.findById.mockResolvedValue({
      _id: groupId,
      adminId,
      members: [{ userId: adminId, role: "admin" }],
    } as any);
    familyGroupRepo.findByMemberId.mockResolvedValue(null);
    familyGroupRepo.addMember.mockResolvedValue({
      _id: groupId,
      members: [{ userId: adminId }, { userId: memberId }],
    } as any);
    familyInviteRepo.markUsed.mockResolvedValue({ token: "token-ok" } as any);
    familyGroupRepo.findByIdWithMembers.mockResolvedValue({
      _id: groupId,
      members: [{ userId: adminId }, { userId: memberId }],
    } as any);

    const result = await service.joinWithInvite("token-ok", memberId, "cousin");

    expect(familyGroupRepo.addMember).toHaveBeenCalled();
    expect(familyInviteRepo.markUsed).toHaveBeenCalledWith("token-ok", memberId);
    expect(familyGroupRepo.updateScore).toHaveBeenCalled();
    expect(result).toHaveProperty("_id", groupId);
  });
});
