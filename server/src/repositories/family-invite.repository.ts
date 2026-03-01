import { FamilyInvite, FamilyInviteDb, FamilyInviteDocument } from "../models/family-invite.model";

export class FamilyInviteRepository {
  async create(data: Partial<FamilyInviteDb>): Promise<FamilyInviteDocument> {
    return FamilyInvite.create(data);
  }

  async findByToken(token: string): Promise<FamilyInviteDb | null> {
    return FamilyInvite.findOne({ token }).lean();
  }

  async markUsed(
    token: string,
    usedBy: string,
  ): Promise<FamilyInviteDb | null> {
    return FamilyInvite.findOneAndUpdate(
      { token },
      { $set: { usedAt: new Date(), usedBy } },
      { new: true },
    ).lean();
  }
}
