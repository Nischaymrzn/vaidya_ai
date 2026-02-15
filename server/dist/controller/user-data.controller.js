"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataController = void 0;
const zod_1 = __importDefault(require("zod"));
const user_data_dto_1 = require("../dtos/user-data.dto");
const user_data_service_1 = require("../services/user-data.service");
const userDataService = new user_data_service_1.UserDataService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
function normalizePayload(payload) {
    const normalized = { ...payload };
    if (normalized.dob === "") {
        delete normalized.dob;
    }
    if (normalized.heightCm === "") {
        delete normalized.heightCm;
    }
    if (normalized.weightKg === "") {
        delete normalized.weightKg;
    }
    return normalized;
}
class UserDataController {
    async getUserData(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const data = await userDataService.getUserData(userId);
            return res.status(200).json({
                success: true,
                userId,
                data,
                message: "User data fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateUserData(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = user_data_dto_1.UpdateUserDataDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const data = await userDataService.updateUserData(userId, parsedData.data);
            return res.status(200).json({
                success: true,
                data,
                message: "User data updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.UserDataController = UserDataController;
