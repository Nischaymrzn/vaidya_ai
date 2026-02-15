"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationsController = void 0;
const zod_1 = __importDefault(require("zod"));
const medications_dto_1 = require("../dtos/medications.dto");
const medications_service_1 = require("../services/medications.service");
const medicationsService = new medications_service_1.MedicationsService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
function normalizePayload(payload) {
    const normalized = { ...payload };
    if (normalized.startDate === "") {
        delete normalized.startDate;
    }
    if (normalized.endDate === "") {
        delete normalized.endDate;
    }
    if (normalized.recordId === "") {
        delete normalized.recordId;
    }
    return normalized;
}
class MedicationsController {
    async createMedication(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = medications_dto_1.CreateMedicationsDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const medication = await medicationsService.createMedication(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: medication,
                message: "Medication created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getMedicationById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const medicationId = req.params.id;
            const medication = await medicationsService.getMedicationById(userId, medicationId);
            return res.status(200).json({
                success: true,
                data: medication,
                message: "Medication fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllMedications(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await medicationsService.getAllMedications(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Medications fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateMedication(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = medications_dto_1.UpdateMedicationsDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const medicationId = req.params.id;
            const updated = await medicationsService.updateMedication(userId, medicationId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Medication updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteMedication(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const medicationId = req.params.id;
            await medicationsService.deleteMedication(userId, medicationId);
            return res
                .status(200)
                .json({ success: true, message: "Medication deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.MedicationsController = MedicationsController;
