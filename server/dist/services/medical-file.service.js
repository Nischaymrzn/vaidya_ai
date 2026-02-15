"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFileService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const medical_file_repository_1 = require("../repositories/medical-file.repository");
const medicalFileRepository = new medical_file_repository_1.MedicalFileRepository();
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
class MedicalFileService {
    async createMedicalFile(userId, data) {
        const { recordId, ...payload } = data;
        const medicalFile = await medicalFileRepository.create({
            ...payload,
            userId,
        });
        if (!medicalFile)
            throw new apiError_1.default(500, "Failed to create medical file");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "medical_files",
                refId: String(medicalFile._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return medicalFile;
    }
    async getMedicalFileById(userId, fileId) {
        const medicalFile = await medicalFileRepository.getForUser(fileId, userId);
        if (!medicalFile)
            throw new apiError_1.default(404, "Medical file not found");
        return medicalFile;
    }
    async getAllMedicalFiles(userId) {
        return medicalFileRepository.getAllForUser(userId);
    }
    async updateMedicalFile(userId, fileId, data) {
        const existing = await medicalFileRepository.getForUser(fileId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Medical file not found");
        const { recordId, ...payload } = data;
        const updated = await medicalFileRepository.update(fileId, userId, payload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update medical file");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "medical_files",
                refId: String(existing._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return updated;
    }
    async deleteMedicalFile(userId, fileId) {
        const existing = await medicalFileRepository.getForUser(fileId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Medical file not found");
        const result = await medicalFileRepository.delete(fileId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete medical file");
        await medicalRecordRepository.removeItemByRef(userId, "medical_files", String(existing._id));
        return true;
    }
}
exports.MedicalFileService = MedicalFileService;
