"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const http_status_codes_1 = require("http-status-codes");
const errorMessages_1 = __importDefault(require("../constants/errorMessages"));
const bcrypt_1 = require("../utils/bcrypt");
const userRepository = new user_repository_1.UserRepository();
class AdminUserService {
    async createUser(data) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (existingUser) {
            throw new apiError_1.default(http_status_codes_1.StatusCodes.CONFLICT, errorMessages_1.default.USER.EXIST);
        }
        const hashedPassword = await bcrypt_1.bcryptUtil.generate(data.password, 12);
        const { name } = data;
        const user = await userRepository.createUser({
            ...data,
            name,
            password: hashedPassword,
        });
        return user;
    }
    async getUserById(id) {
        const user = await userRepository.getUserById(id);
        if (!user)
            throw new apiError_1.default(404, "User not found");
        return user;
    }
    async getAllUsers(options) {
        return userRepository.getAllUsers(options);
    }
    async updateOneUser(id, data) {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser)
            throw new apiError_1.default(404, "User not found");
        if (existingUser.email !== data.email) {
            const emailExists = await userRepository.getUserByEmail(data.email);
            if (emailExists) {
                throw new apiError_1.default(403, "Email already in use");
            }
        }
        if (data.password) {
            const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateOneUser(id, data);
        if (!updatedUser)
            throw new apiError_1.default(500, "Failed to update user");
        return updatedUser;
    }
    async deleteOneUser(id) {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser)
            throw new apiError_1.default(404, "User not found");
        const result = await userRepository.deleteOneUser(id);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete user");
        return true;
    }
}
exports.AdminUserService = AdminUserService;
