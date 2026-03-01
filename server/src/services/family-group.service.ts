import crypto from "crypto";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import ApiError from "../exceptions/apiError";
import { FamilyGroupRepository } from "../repositories/family-group.repository";
import { FamilyInviteRepository } from "../repositories/family-invite.repository";
import { UserRepository } from "../repositories/user.repository";
import { UserDataRepository } from "../repositories/user-data.repository";
import { VitalsRepository } from "../repositories/vitals.repository";

const familyGroupRepository = new FamilyGroupRepository();
const familyInviteRepository = new FamilyInviteRepository();
const userRepository = new UserRepository();
const userDataRepository = new UserDataRepository();
const vitalsRepository = new VitalsRepository();

const DEFAULT_INVITE_DAYS = 7;

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

const isAdminMember = (group: { adminId: unknown; members?: Array<{ userId: unknown; role?: string }> }, userId: string) => {
  if (String(group.adminId) === userId) return true;
  return Boolean(group.members?.some((member) => String(member.userId) === userId && member.role === "admin"));
};

const clamp = (value: number, min = 35, max = 95) =>
  Math.min(max, Math.max(min, value));

const computeHealthScore = (
  vitals?: {
    systolicBp?: number | null;
    diastolicBp?: number | null;
    glucoseLevel?: number | null;
    heartRate?: number | null;
    bmi?: number | null;
  } | null,
) => {
  if (!vitals) return null;
  let score = 90;
  if (typeof vitals.systolicBp === "number" && vitals.systolicBp >= 140) {
    score -= 15;
  }
  if (typeof vitals.systolicBp === "number" && vitals.systolicBp >= 160) {
    score -= 10;
  }
  if (typeof vitals.diastolicBp === "number" && vitals.diastolicBp >= 90) {
    score -= 10;
  }
  if (typeof vitals.glucoseLevel === "number" && vitals.glucoseLevel >= 160) {
    score -= 10;
  }
  if (
    typeof vitals.heartRate === "number" &&
    (vitals.heartRate > 100 || vitals.heartRate < 60)
  ) {
    score -= 8;
  }
  if (typeof vitals.bmi === "number" && vitals.bmi >= 30) {
    score -= 7;
  }
  return clamp(Math.round(score));
};

const deriveStatus = (score: number | null) => {
  if (score === null) return "warning";
  if (score < 65) return "critical";
  if (score < 80) return "warning";
  return "stable";
};

const computeAge = (dob?: Date | null) => {
  if (!dob) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
};

const coalesceNumber = (
  value?: number | null,
  fallback?: number | null,
) => {
  if (typeof value === "number") return value;
  if (typeof fallback === "number") return fallback;
  return null;
};

const mapVitalsRecord = (record?: {
  recordedAt?: Date;
  createdAt?: Date;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  glucoseLevel?: number | null;
  heartRate?: number | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
} | null) => {
  if (!record) return null;
  const recordedAt =
    record.recordedAt ?? (record as { createdAt?: Date }).createdAt ?? null;
  return {
    recordedAt,
    systolicBp: typeof record.systolicBp === "number" ? record.systolicBp : null,
    diastolicBp: typeof record.diastolicBp === "number" ? record.diastolicBp : null,
    glucoseLevel: typeof record.glucoseLevel === "number" ? record.glucoseLevel : null,
    heartRate: typeof record.heartRate === "number" ? record.heartRate : null,
    weight: typeof record.weight === "number" ? record.weight : null,
    height: typeof record.height === "number" ? record.height : null,
    bmi: typeof record.bmi === "number" ? record.bmi : null,
  };
};

export class FamilyGroupService {
  async getFamilyGroupForUser(userId: string) {
    const group = await familyGroupRepository.findByMemberId(userId);
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family group not found");
    }
    return (
      (await familyGroupRepository.findByIdWithMembers(String(group._id))) ??
      group
    );
  }

  async getGroupSummaryForUser(userId: string) {
    const group = await familyGroupRepository.findByMemberId(userId);
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family group not found");
    }

    const groupId = String(group._id);
    const members = group.members ?? [];
    const memberIds = members.map((member) => String(member.userId));

    const [users, userData] = await Promise.all([
      userRepository.getUsersByIds(memberIds),
      userDataRepository.getByUserIds(memberIds),
    ]);

    const vitalsLists = await Promise.all(
      memberIds.map((memberId) => vitalsRepository.getAllForUser(memberId)),
    );
    const vitalsMap = new Map(
      memberIds.map((memberId, index) => [
        memberId,
        vitalsLists[index] ?? [],
      ]),
    );

    const userMap = new Map(
      users.map((user) => [String(user._id), user]),
    );
    const userDataMap = new Map(
      userData.map((item) => [String(item.userId), item]),
    );

    const memberSummaries = members.map((member) => {
      const memberId = String(member.userId);
      const user = userMap.get(memberId);
      const data = userDataMap.get(memberId);
      const vitalsRecords = vitalsMap.get(memberId) ?? [];
      const latestRecord = vitalsRecords[0];
      const fallbackVitals = data?.vitals ?? data?.latestVitals ?? null;
      const latestVitals = latestRecord || fallbackVitals
        ? {
            recordedAt:
              latestRecord?.recordedAt ??
              (latestRecord as { createdAt?: Date })?.createdAt ??
              fallbackVitals?.recordedAt ??
              null,
            systolicBp: coalesceNumber(
              latestRecord?.systolicBp,
              fallbackVitals?.systolicBp,
            ),
            diastolicBp: coalesceNumber(
              latestRecord?.diastolicBp,
              fallbackVitals?.diastolicBp,
            ),
            glucoseLevel: coalesceNumber(
              latestRecord?.glucoseLevel,
              fallbackVitals?.glucoseLevel,
            ),
            heartRate: coalesceNumber(
              latestRecord?.heartRate,
              fallbackVitals?.heartRate,
            ),
            weight: coalesceNumber(
              latestRecord?.weight,
              fallbackVitals?.weight,
            ),
            height: coalesceNumber(
              latestRecord?.height,
              fallbackVitals?.height,
            ),
            bmi: coalesceNumber(
              latestRecord?.bmi,
              fallbackVitals?.bmi,
            ),
          }
        : null;
      const healthScore = computeHealthScore(latestVitals);
      const status = deriveStatus(healthScore);
      const lastUpdated =
        latestVitals?.recordedAt ??
        (data as any)?.updatedAt ??
        (data as any)?.createdAt ??
        null;
      const recentVitals = vitalsRecords
        .map((record) => mapVitalsRecord(record))
        .filter(Boolean);

      return {
        userId: memberId,
        name: data?.fullName || user?.name || "Member",
        email: user?.email ?? null,
        relation: member.relation ?? null,
        role: member.role,
        joinedAt: member.joinedAt ?? null,
        age: computeAge(data?.dob ?? null),
        gender: data?.gender ?? null,
        latestVitals,
        recentVitals,
        lastUpdated,
        healthScore,
        status,
      };
    });
    const currentMember = members.find(
      (member) => String(member.userId) === userId,
    );
    const currentUserRole =
      currentMember?.role ??
      (String(group.adminId) === userId ? "admin" : "member");

    return {
      group: {
        _id: groupId,
        name: group.name,
        adminId: String(group.adminId),
        createdAt: (group as any).createdAt ?? null,
        updatedAt: (group as any).updatedAt ?? null,
      },
      members: memberSummaries,
      currentUser: {
        id: userId,
        role: currentUserRole,
        relation: currentMember?.relation ?? null,
      },
    };
  }

  async createFamilyGroup(userId: string, name: string) {
    const existingGroup = await familyGroupRepository.findByMemberId(userId);
    if (existingGroup) {
      throw new ApiError(StatusCodes.CONFLICT, "User already belongs to a family group");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const group = await familyGroupRepository.create({
      name,
      adminId: toObjectId(userId),
      members: [
        {
          userId: toObjectId(userId),
          role: "admin",
          relation: "self",
          joinedAt: new Date(),
        },
      ],
    });

    return (
      (await familyGroupRepository.findByIdWithMembers(String(group._id))) ??
      group.toObject()
    );
  }

  async createInvite(groupId: string, inviterId: string, expiresInDays?: number) {
    const group = await familyGroupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family group not found");
    }

    if (!isAdminMember(group, inviterId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Only family admins can invite members");
    }

    const token = crypto.randomBytes(24).toString("hex");
    const days = expiresInDays ?? DEFAULT_INVITE_DAYS;
    const expiresAt = new Date(Date.now() + days * 86400000);

    await familyInviteRepository.create({
      groupId: toObjectId(groupId),
      token,
      invitedBy: toObjectId(inviterId),
      expiresAt,
    });

    const inviteLink = `${env.CLIENT_URL}/family-health/join?token=${token}`;

    return { token, inviteLink, expiresAt };
  }

  async addMemberByUserId(
    groupId: string,
    adminId: string,
    userId: string,
    relation?: string,
  ) {
    const group = await familyGroupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family group not found");
    }

    if (!isAdminMember(group, adminId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Only family admins can add members");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    const existingGroup = await familyGroupRepository.findByMemberId(userId);
    if (existingGroup && String(existingGroup._id) !== groupId) {
      throw new ApiError(StatusCodes.CONFLICT, "User already belongs to a family group");
    }

    if (group.members.some((member) => String(member.userId) === userId)) {
      throw new ApiError(StatusCodes.CONFLICT, "User already in this family group");
    }

    const updatedGroup = await familyGroupRepository.addMember(groupId, {
      userId: toObjectId(userId),
      role: "member",
      relation,
      invitedBy: toObjectId(adminId),
      joinedAt: new Date(),
    });
    if (!updatedGroup) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family group not found");
    }

    return (
      (await familyGroupRepository.findByIdWithMembers(groupId)) ?? updatedGroup
    );
  }

  async updateMemberRelation(
    groupId: string,
    adminId: string,
    memberId: string,
    relation?: string,
  ) {
    const group = await familyGroupRepository.findById(groupId);
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family group not found");
    }

    if (!isAdminMember(group, adminId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Only family admins can update relations");
    }

    const cleanRelation = relation?.trim() || undefined;
    const updatedGroup = await familyGroupRepository.updateMemberRelation(
      groupId,
      memberId,
      cleanRelation,
    );
    if (!updatedGroup) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family member not found");
    }

    return (
      (await familyGroupRepository.findByIdWithMembers(String(updatedGroup._id))) ??
      updatedGroup
    );
  }

  async joinWithInvite(token: string, userId: string, relation?: string) {
    const invite = await familyInviteRepository.findByToken(token);
    if (!invite) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Invite link not found");
    }

    if (invite.usedAt) {
      throw new ApiError(StatusCodes.GONE, "Invite link already used");
    }

    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      throw new ApiError(StatusCodes.GONE, "Invite link has expired");
    }

    const group = await familyGroupRepository.findById(String(invite.groupId));
    if (!group) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Family group not found");
    }

    const existingGroup = await familyGroupRepository.findByMemberId(userId);
    if (existingGroup && String(existingGroup._id) !== String(group._id)) {
      throw new ApiError(StatusCodes.CONFLICT, "User already belongs to a family group");
    }

    if (!group.members.some((member) => String(member.userId) === userId)) {
      await familyGroupRepository.addMember(group._id.toString(), {
        userId: toObjectId(userId),
        role: "member",
        relation,
        invitedBy: invite.invitedBy,
        joinedAt: new Date(),
      });
    }

    await familyInviteRepository.markUsed(token, userId);

    return familyGroupRepository.findByIdWithMembers(String(group._id));
  }
}
