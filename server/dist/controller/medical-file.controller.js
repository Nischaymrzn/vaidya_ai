"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFileController = void 0;
const zod_1 = __importDefault(require("zod"));
const medical_file_dto_1 = require("../dtos/medical-file.dto");
const medical_file_service_1 = require("../services/medical-file.service");
const env_1 = require("../config/env");
const cloudinary_1 = require("../utils/cloudinary");
const medicalFileService = new medical_file_service_1.MedicalFileService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
async function buildFile(req) {
    const file = req.file;
    if (!file)
        return null;
    const isPdf = file.mimetype === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";
    const { url, publicId } = await (0, cloudinary_1.uploadFileBuffer)(file.buffer, {
        folder: `${env_1.env.CLOUDINARY_FOLDER}/medical-files`,
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
}
function normalizePayload(payload) {
    const normalized = { ...payload };
    if (normalized.uploadedAt === "") {
        delete normalized.uploadedAt;
    }
    if (normalized.recordId === "") {
        delete normalized.recordId;
    }
    return normalized;
}
class MedicalFileController {
    async createMedicalFile(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = medical_file_dto_1.CreateMedicalFileDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const fileMeta = await buildFile(req);
            const url = fileMeta?.url ?? parsedData.data.url;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: "File upload or url is required",
                });
            }
            const medicalFile = await medicalFileService.createMedicalFile(userId, {
                ...parsedData.data,
                ...fileMeta,
                url,
            });
            return res.status(201).json({
                success: true,
                data: medicalFile,
                message: "Medical file created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getMedicalFileById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const fileId = req.params.id;
            const medicalFile = await medicalFileService.getMedicalFileById(userId, fileId);
            return res.status(200).json({
                success: true,
                data: medicalFile,
                message: "Medical file fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllMedicalFiles(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await medicalFileService.getAllMedicalFiles(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Medical files fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateMedicalFile(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = medical_file_dto_1.UpdateMedicalFileDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const fileId = req.params.id;
            const updated = await medicalFileService.updateMedicalFile(userId, fileId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Medical file updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteMedicalFile(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const fileId = req.params.id;
            await medicalFileService.deleteMedicalFile(userId, fileId);
            return res
                .status(200)
                .json({ success: true, message: "Medical file deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.MedicalFileController = MedicalFileController;
