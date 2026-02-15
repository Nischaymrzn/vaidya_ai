"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymptomsController = void 0;
const zod_1 = __importDefault(require("zod"));
const symptoms_dto_1 = require("../dtos/symptoms.dto");
const symptoms_service_1 = require("../services/symptoms.service");
const symptomsService = new symptoms_service_1.SymptomsService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
function normalizePayload(payload) {
    const normalized = { ...payload };
    if (normalized.loggedAt === "") {
        delete normalized.loggedAt;
    }
    if (normalized.recordId === "") {
        delete normalized.recordId;
    }
    if (typeof normalized.symptomList === "string") {
        try {
            const parsed = JSON.parse(normalized.symptomList);
            if (Array.isArray(parsed)) {
                normalized.symptomList = parsed;
            }
            else {
                normalized.symptomList = String(normalized.symptomList)
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
        }
        catch {
            normalized.symptomList = String(normalized.symptomList)
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }
    return normalized;
}
class SymptomsController {
    async createSymptoms(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = symptoms_dto_1.CreateSymptomsDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const symptoms = await symptomsService.createSymptoms(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: symptoms,
                message: "Symptoms created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getSymptomsById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const symptomsId = req.params.id;
            const symptoms = await symptomsService.getSymptomsById(userId, symptomsId);
            return res.status(200).json({
                success: true,
                data: symptoms,
                message: "Symptoms fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllSymptoms(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await symptomsService.getAllSymptoms(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Symptoms fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateSymptoms(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = symptoms_dto_1.UpdateSymptomsDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const symptomsId = req.params.id;
            const updated = await symptomsService.updateSymptoms(userId, symptomsId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Symptoms updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteSymptoms(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const symptomsId = req.params.id;
            await symptomsService.deleteSymptoms(userId, symptomsId);
            return res
                .status(200)
                .json({ success: true, message: "Symptoms deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.SymptomsController = SymptomsController;
