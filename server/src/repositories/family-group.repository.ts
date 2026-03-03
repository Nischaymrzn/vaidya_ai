import {
  FamilyGroup,
  FamilyGroupDb,
  FamilyGroupDocument,
  FamilyMemberDb,
} from "../models/family-group.model";

export class FamilyGroupRepository {
  async create(data: Partial<FamilyGroupDb>): Promise<FamilyGroupDocument> {
    return FamilyGroup.create(data);
  }

  async findById(id: string): Promise<FamilyGroupDb | null> {
    return FamilyGroup.findById(id).lean();
  }

  async findByIdWithMembers(id: string): Promise<FamilyGroupDb | null> {
    return FamilyGroup.findById(id)
      .populate("members.userId", "name email")
      .lean();
  }

  async findByMemberId(userId: string): Promise<FamilyGroupDb | null> {
    return FamilyGroup.findOne({ "members.userId": userId }).lean();
  }

  async addMember(
    groupId: string,
    member: FamilyMemberDb,
  ): Promise<FamilyGroupDb | null> {
    return FamilyGroup.findByIdAndUpdate(
      groupId,
      { $push: { members: member } },
      { new: true },
    ).lean();
  }

  async updateName(
    groupId: string,
    name: string,
  ): Promise<FamilyGroupDb | null> {
    return FamilyGroup.findByIdAndUpdate(
      groupId,
      { $set: { name } },
      { new: true },
    ).lean();
  }

  async updateMemberRelation(
    groupId: string,
    memberId: string,
    relation?: string,
  ): Promise<FamilyGroupDb | null> {
    return FamilyGroup.findOneAndUpdate(
      { _id: groupId, "members.userId": memberId },
      { $set: { "members.$.relation": relation } },
      { new: true },
    ).lean();
  }

  async updateScore(
    groupId: string,
    score: number,
  ): Promise<FamilyGroupDb | null> {
    return FamilyGroup.findByIdAndUpdate(
      groupId,
      { $set: { score } },
      { new: true },
    ).lean();
  }
}
