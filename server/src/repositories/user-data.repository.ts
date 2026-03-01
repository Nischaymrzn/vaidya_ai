import {
  UserData,
  UserDataDb,
  UserDataDocument,
} from "../models/user-data.model";

export interface IUserDataRepository {
  getByUserId(userId: string): Promise<UserDataDb | null>;
  getByUserIds(userIds: string[]): Promise<UserDataDb[]>;
  upsert(
    userId: string,
    update: Record<string, unknown>,
  ): Promise<UserDataDocument | null>;
}

export class UserDataRepository implements IUserDataRepository {
  async getByUserId(userId: string): Promise<UserDataDb | null> {
    return UserData.findOne({ $or: [{ userId }, { user: userId }] }).lean();
  }

  async getByUserIds(userIds: string[]): Promise<UserDataDb[]> {
    if (!userIds.length) return [];
    return UserData.find({
      $or: [{ userId: { $in: userIds } }, { user: { $in: userIds } }],
    }).lean();
  }

  async upsert(
    userId: string,
    update: Record<string, unknown>,
  ): Promise<UserDataDocument | null> {
    const updateDoc = update as Record<string, any>;
    const existingSet = typeof updateDoc.$set === "object" && updateDoc.$set ? { ...updateDoc.$set } : {};
    const existingSetOnInsert =
      typeof updateDoc.$setOnInsert === "object" && updateDoc.$setOnInsert
        ? { ...updateDoc.$setOnInsert }
        : {};
    delete existingSet.userId;
    delete existingSet.user;
    delete existingSetOnInsert.userId;
    delete existingSetOnInsert.user;
    const { userId: _userId, user: _user, ...restUpdate } = updateDoc;
    const nextUpdate = {
      ...restUpdate,
      $set: {
        ...existingSet,
        user: userId,
      },
      $setOnInsert: {
        ...existingSetOnInsert,
        userId,
      },
    };
    return UserData.findOneAndUpdate(
      { $or: [{ userId }, { user: userId }] },
      nextUpdate,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );
  }
}
