"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordController = void 0;
const zod_1 = __importDefault(require("zod"));
const medical_record_dto_1 = require("../dtos/medical-record.dto");
const env_1 = require("../config/env");
const cloudinary_1 = require("../utils/cloudinary");
const medical_record_service_1 = require("../services/medical-record.service");
const medicalRecordService = new medical_record_service_1.MedicalRecordService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
async function buildAttachments(req) {
    const files = Array.isArray(req.files)
        ? req.files
        : req.file
            ? [req.file]
            : [];
    if (!files.length)
        return [];
    const uploads = await Promise.all(files.map(async (file) => {
        const isPdf = file.mimetype === "application/pdf";
        const resourceType = isPdf ? "raw" : "image";
        const { url, publicId } = await (0, cloudinary_1.uploadFileBuffer)(file.buffer, {
            folder: `${env_1.env.CLOUDINARY_FOLDER}/medical-records`,
            resourceType,
            fileName: file.originalname,
            format: isPdf ? "pdf" : undefined,
        });
        return {
            url,
            publicId,
            type: file.mimetype,
            name: file.originalname,
            size: file.size,
        };
    }));
    return uploads;
}
function normalizePayload(payload) {
    const normalized = { ...payload };
    if (!normalized.recordDate && normalized.date) {
        normalized.recordDate = normalized.date;
        delete normalized.date;
    }
    if (normalized.recordDate === "") {
        delete normalized.recordDate;
    }
    const jsonFields = [
        "structuredData",
        "items",
        "vitals",
        "symptoms",
        "medications",
        "labTests",
        "medicalFiles",
        "allergies",
        "immunizations",
    ];
    for (const field of jsonFields) {
        if (typeof normalized[field] === "string") {
            try {
                normalized[field] = JSON.parse(normalized[field]);
            }
            catch {
                delete normalized[field];
            }
        }
    }
    return normalized;
}
class MedicalRecordController {
    async createRecord(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = medical_record_dto_1.CreateMedicalRecordDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const attachments = await buildAttachments(req);
            const record = await medicalRecordService.createRecord(userId, {
                ...parsedData.data,
                attachments,
            });
            return res.status(201).json({
                success: true,
                data: record,
                message: "Medical record created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getRecordById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const recordId = req.params.id;
            const record = await medicalRecordService.getRecordById(userId, recordId);
            return res.status(200).json({
                success: true,
                data: record,
                message: "Medical record fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllRecords(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await medicalRecordService.getAllRecords(userId, {
                page,
                limit,
            });
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
                message: "Medical records fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateRecord(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = medical_record_dto_1.UpdateMedicalRecordDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const attachments = await buildAttachments(req);
            const recordId = req.params.id;
            const updatedRecord = await medicalRecordService.updateRecord(userId, recordId, {
                ...parsedData.data,
                ...(attachments.length ? { attachments } : {}),
            });
            return res.status(200).json({
                success: true,
                data: updatedRecord,
                message: "Medical record updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteRecord(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const recordId = req.params.id;
            await medicalRecordService.deleteRecord(userId, recordId);
            return res
                .status(200)
                .json({ success: true, message: "Medical record deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.MedicalRecordController = MedicalRecordController;
