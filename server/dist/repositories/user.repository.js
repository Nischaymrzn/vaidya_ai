"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const auth_model_1 = require("../models/auth.model");
class UserRepository {
    async getAllUsers(options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(100, Math.max(1, options?.limit ?? 10));
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            auth_model_1.User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            auth_model_1.User.countDocuments(),
        ]);
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async createUser(userData) {
        return auth_model_1.User.create(userData);
    }
    async getUserByEmail(email) {
        return auth_model_1.User.findOne({ email });
    }
    async getUserByGoogleId(googleId) {
        return auth_model_1.User.findOne({ googleId });
    }
    async getUserById(id) {
        return auth_model_1.User.findOne({ _id: id });
    }
    async getUserWithPasswordByEmail(email) {
        return auth_model_1.User.findOne({ email }).select("+password");
    }
    async updateOneUser(id, data) {
        const updatedUser = await auth_model_1.User.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }
    async deleteOneUser(id) {
        const result = await auth_model_1.User.findByIdAndDelete(id);
        return result ? true : null;
    }
}
exports.UserRepository = UserRepository;
