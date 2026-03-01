import { UserType } from "../types/user.types";
import { UserDocument, User } from "../models/auth.model";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IUserRepository {
  createUser(userData: Partial<UserType>): Promise<UserDocument>;
  getUserByEmail(email: string): Promise<UserDocument | null>;
  getUserByGoogleId(googleId: string): Promise<UserDocument | null>;
  getUserById(id: string): Promise<UserType | null>;
  getUsersByIds(
    ids: string[]
  ): Promise<Array<{ _id: string; name?: string; email?: string }>>;
  getAllUsers(options?: PaginationParams): Promise<PaginatedResult<UserType>>;
  updateOneUser(id: string, data: Partial<UserType>): Promise<UserType | null>;
  deleteOneUser(id: string): Promise<boolean | null>;
}

export class UserRepository implements IUserRepository {
  async getAllUsers(options?: PaginationParams): Promise<PaginatedResult<UserType>> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    return {
      data: users as UserType[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
  async createUser(userData: Partial<UserType>): Promise<UserDocument> {
    return User.create(userData);
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email });
  }

  async getUserByGoogleId(googleId: string): Promise<UserDocument | null> {
    return User.findOne({ googleId });
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return User.findOne({ _id: id });
  }

  async getUsersByIds(
    ids: string[]
  ): Promise<Array<{ _id: string; name?: string; email?: string }>> {
    if (!ids.length) return [];
    const users = await User.find({ _id: { $in: ids } })
      .select("name email")
      .lean();
    return users.map((user) => ({
      _id: String(user._id),
      name: user.name,
      email: user.email,
    }));
  }

  async getUserWithPasswordByEmail(
    email: string
  ): Promise<UserDocument | null> {
    return User.findOne({ email }).select("+password");
  }

  async updateOneUser(id: string, data: Partial<UserType>): Promise<UserType | null> {
    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    return updatedUser;
  }
  async deleteOneUser(id: string): Promise<boolean | null> {
    const result = await User.findByIdAndDelete(id);
    return result ? true : null;
  }
}
