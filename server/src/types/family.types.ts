export type FamilyMemberRole = "admin" | "member";

export type FamilyMemberType = {
  userId: string;
  role: FamilyMemberRole;
  relation?: string;
  joinedAt?: Date;
  invitedBy?: string;
};

export type FamilyGroupType = {
  name: string;
  adminId: string;
  members: FamilyMemberType[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type FamilyInviteType = {
  groupId: string;
  token: string;
  invitedBy: string;
  expiresAt?: Date;
  usedAt?: Date;
  usedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
