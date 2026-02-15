"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const zod_1 = __importDefault(require("zod"));
const user_dto_1 = require("../dtos/user.dto");
const cloudinary_1 = require("../utils/cloudinary");
const env_1 = require("../config/env");
const admin_service_1 = require("../services/admin.service");
const adminUserService = new admin_service_1.AdminUserService();
class AdminUserController {
    async createUser(req, res) {
        try {
            const parsedData = user_dto_1.CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            if (req.file?.buffer) {
                const { url } = await (0, cloudinary_1.uploadImageBuffer)(req.file.buffer, {
                    folder: `${env_1.env.CLOUDINARY_FOLDER}/users`,
                });
                parsedData.data.profilePicture = url;
            }
            const newUser = await adminUserService.createUser(parsedData.data);
            return res
                .status(201)
                .json({
                success: true,
                data: newUser,
                message: "User created successfully",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await adminUserService.getUserById(userId);
            return res
                .status(200)
                .json({ success: true, data: user, message: "User Fetched" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await adminUserService.getAllUsers({ page, limit });
            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev,
                },
                message: "Users Fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateOneUser(req, res) {
        try {
            const userId = req.params.id;
            const parsedData = user_dto_1.UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            if (req.file?.buffer) {
                const { url } = await (0, cloudinary_1.uploadImageBuffer)(req.file.buffer, {
                    folder: `${env_1.env.CLOUDINARY_FOLDER}/users`,
                });
                parsedData.data.profilePicture = url;
            }
            const updatedUser = await adminUserService.updateOneUser(userId, parsedData.data);
            return res
                .status(200)
                .json({ success: true, data: updatedUser, message: "User Updated" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteOneUser(req, res) {
        try {
            const userId = req.params.id;
            await adminUserService.deleteOneUser(userId);
            return res.status(200).json({ success: true, message: "User Deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.AdminUserController = AdminUserController;
