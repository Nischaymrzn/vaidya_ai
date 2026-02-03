import { UserType } from "../types/user.types";
import { UserDocument, User } from "../models/auth.model";

export interface IUserRepository {
  createUser(userData: Partial<UserType>): Promise<UserDocument>;
  getUserByEmail(email: string): Promise<UserDocument | null>;
  getUserById(id: string): Promise<UserType | null>; 
  getAllUsers(): Promise<UserType[]>;
  updateOneUser(id: string, data: Partial<UserType>): Promise<UserType | null>; 
  deleteOneUser(id: string): Promise<boolean | null>;  
}

export class UserRepository implements IUserRepository {
  async getAllUsers(): Promise<UserType[]> {
    const users = await User.find();
    return users;
  }
  async createUser(userData: Partial<UserType>): Promise<UserDocument> {
    return User.create(userData);
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email });
  }

  async getUserById(id: string): Promise<UserDocument | null> {
    return User.findOne({ _id: id });
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
