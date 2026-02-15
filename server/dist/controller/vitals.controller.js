"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalsController = void 0;
const zod_1 = __importDefault(require("zod"));
const vitals_dto_1 = require("../dtos/vitals.dto");
const vitals_service_1 = require("../services/vitals.service");
const vitalsService = new vitals_service_1.VitalsService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
function normalizePayload(payload) {
    const normalized = { ...payload };
    if (normalized.recordedAt === "") {
        delete normalized.recordedAt;
    }
    if (normalized.bmi === "") {
        delete normalized.bmi;
    }
    if (normalized.recordId === "") {
        delete normalized.recordId;
    }
    return normalized;
}
class VitalsController {
    async createVitals(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = vitals_dto_1.CreateVitalsDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const vitals = await vitalsService.createVitals(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: vitals,
                message: "Vitals created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getVitalsById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const vitalsId = req.params.id;
            const vitals = await vitalsService.getVitalsById(userId, vitalsId);
            return res.status(200).json({
                success: true,
                data: vitals,
                message: "Vitals fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllVitals(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await vitalsService.getAllVitals(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Vitals fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateVitals(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = vitals_dto_1.UpdateVitalsDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const vitalsId = req.params.id;
            const updated = await vitalsService.updateVitals(userId, vitalsId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Vitals updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteVitals(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const vitalsId = req.params.id;
            await vitalsService.deleteVitals(userId, vitalsId);
            return res
                .status(200)
                .json({ success: true, message: "Vitals deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.VitalsController = VitalsController;
