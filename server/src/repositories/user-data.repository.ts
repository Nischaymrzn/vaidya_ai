import {
  UserData,
  UserDataDb,
  UserDataDocument,
} from "../models/user-data.model";

export interface IUserDataRepository {
  getByUserId(userId: string): Promise<UserDataDb | null>;
  upsert(
    userId: string,
    update: Record<string, unknown>,
  ): Promise<UserDataDocument | null>;
}

export class UserDataRepository implements IUserDataRepository {
  async getByUserId(userId: string): Promise<UserDataDb | null> {
    return UserData.findOne({ userId }).lean();
  }

  async upsert(
    userId: string,
    update: Record<string, unknown>,
  ): Promise<UserDataDocument | null> {
    const updateDoc = update as Record<string, any>;
    const existingSetOnInsert =
      typeof updateDoc.$setOnInsert === "object" && updateDoc.$setOnInsert
        ? updateDoc.$setOnInsert
        : {};
    return UserData.findOneAndUpdate(
      { userId },
      {
        ...update,
        $setOnInsert: { userId, ...existingSetOnInsert },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );
  }
}
