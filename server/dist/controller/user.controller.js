"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const zod_1 = __importDefault(require("zod"));
const user_dto_1 = require("../dtos/user.dto");
const cloudinary_1 = require("../utils/cloudinary");
const env_1 = require("../config/env");
const userService = new user_service_1.UserService();
class UserController {
    async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await userService.getUserById(userId);
            return res
                .status(200)
                .json({ success: true, data: user, message: "User Fetched" });
        }
        catch (error) {
            return res
                .status(error.statusCode || 500)
                .json({
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
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) }); // z.prettifyError - better error messages (zod)
            }
            if (req.file?.buffer) {
                const { url } = await (0, cloudinary_1.uploadImageBuffer)(req.file.buffer, {
                    folder: `${env_1.env.CLOUDINARY_FOLDER}/users`,
                });
                parsedData.data.profilePicture = url;
            }
            const updatedUser = await userService.updateOneUser(userId, parsedData.data);
            return res
                .status(200)
                .json({ success: true, data: updatedUser, message: "User Updated" });
        }
        catch (error) {
            return res
                .status(error.statusCode || 500)
                .json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteOneUser(req, res) {
        try {
            const userId = req.params.id;
            await userService.deleteOneUser(userId);
            return res.status(200).json({ success: true, message: "User Deleted" });
        }
        catch (error) {
            return res
                .status(error.statusCode || 500)
                .json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.UserController = UserController;
