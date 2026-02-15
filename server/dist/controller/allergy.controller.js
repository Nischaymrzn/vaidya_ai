"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllergyController = void 0;
const zod_1 = __importDefault(require("zod"));
const allergy_dto_1 = require("../dtos/allergy.dto");
const allergy_service_1 = require("../services/allergy.service");
const allergyService = new allergy_service_1.AllergyService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
class AllergyController {
    async createAllergy(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = allergy_dto_1.CreateAllergyDto.safeParse(req.body ?? {});
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const allergy = await allergyService.createAllergy(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: allergy,
                message: "Allergy created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllergyById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const allergyId = req.params.id;
            const allergy = await allergyService.getAllergyById(userId, allergyId);
            return res.status(200).json({
                success: true,
                data: allergy,
                message: "Allergy fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllAllergies(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await allergyService.getAllAllergies(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Allergies fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateAllergy(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = allergy_dto_1.UpdateAllergyDto.safeParse(req.body ?? {});
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const allergyId = req.params.id;
            const updated = await allergyService.updateAllergy(userId, allergyId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Allergy updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteAllergy(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const allergyId = req.params.id;
            await allergyService.deleteAllergy(userId, allergyId);
            return res
                .status(200)
                .json({ success: true, message: "Allergy deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.AllergyController = AllergyController;
