import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { CreateUserDTO, UpdateUserDto } from "../dtos/user.dto";
import ApiError from "../exceptions/apiError";
import { StatusCodes } from "http-status-codes";
import errorMessages from "../constants/errorMessages";
import { bcryptUtil } from "../utils/bcrypt";
let userRepository = new UserRepository();
export class AdminUserService {
  async createUser(data: CreateUserDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, errorMessages.USER.EXIST);
    }

    const hashedPassword = await bcryptUtil.generate(data.password, 12);
    const { name } = data;
    const user = await userRepository.createUser({
      ...data,
      name,
      password: hashedPassword,
    });
    return user;
  }
  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  }
  async getAllUsers(options?: { page?: number; limit?: number }) {
    return userRepository.getAllUsers(options);
  }
  async updateOneUser(id: string, data: UpdateUserDto) {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) throw new ApiError(404, "User not found");
    if (existingUser.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email!);
      if (emailExists) {
        throw new ApiError(403, "Email already in use");
      }
    }
    if (data.password) {
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;
    }
    const updatedUser = await userRepository.updateOneUser(id, data);
    if (!updatedUser) throw new ApiError(500, "Failed to update user");
    return updatedUser;
  }
  async deleteOneUser(id: string) {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) throw new ApiError(404, "User not found");
    const result = await userRepository.deleteOneUser(id);
    if (!result) throw new ApiError(500, "Failed to delete user");
    return true;
  }
}
