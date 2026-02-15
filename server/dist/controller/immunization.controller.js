"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmunizationController = void 0;
const zod_1 = __importDefault(require("zod"));
const immunization_dto_1 = require("../dtos/immunization.dto");
const immunization_service_1 = require("../services/immunization.service");
const immunizationService = new immunization_service_1.ImmunizationService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
class ImmunizationController {
    async createImmunization(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = immunization_dto_1.CreateImmunizationDto.safeParse(req.body ?? {});
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const immunization = await immunizationService.createImmunization(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: immunization,
                message: "Immunization created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getImmunizationById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const immunizationId = req.params.id;
            const immunization = await immunizationService.getImmunizationById(userId, immunizationId);
            return res.status(200).json({
                success: true,
                data: immunization,
                message: "Immunization fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllImmunizations(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await immunizationService.getAllImmunizations(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Immunizations fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateImmunization(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = immunization_dto_1.UpdateImmunizationDto.safeParse(req.body ?? {});
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const immunizationId = req.params.id;
            const updated = await immunizationService.updateImmunization(userId, immunizationId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Immunization updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteImmunization(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const immunizationId = req.params.id;
            await immunizationService.deleteImmunization(userId, immunizationId);
            return res
                .status(200)
                .json({ success: true, message: "Immunization deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.ImmunizationController = ImmunizationController;
