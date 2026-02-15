"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymptomsService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const symptoms_repository_1 = require("../repositories/symptoms.repository");
const symptomsRepository = new symptoms_repository_1.SymptomsRepository();
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
class SymptomsService {
    async createSymptoms(userId, data) {
        const { recordId, ...payload } = data;
        const symptoms = await symptomsRepository.create({ ...payload, userId });
        if (!symptoms)
            throw new apiError_1.default(500, "Failed to create symptoms");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "symptoms",
                refId: String(symptoms._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return symptoms;
    }
    async getSymptomsById(userId, symptomsId) {
        const symptoms = await symptomsRepository.getForUser(symptomsId, userId);
        if (!symptoms)
            throw new apiError_1.default(404, "Symptoms not found");
        return symptoms;
    }
    async getAllSymptoms(userId) {
        return symptomsRepository.getAllForUser(userId);
    }
    async updateSymptoms(userId, symptomsId, data) {
        const existing = await symptomsRepository.getForUser(symptomsId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Symptoms not found");
        const { recordId, ...payload } = data;
        const updated = await symptomsRepository.update(symptomsId, userId, payload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update symptoms");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "symptoms",
                refId: String(existing._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return updated;
    }
    async deleteSymptoms(userId, symptomsId) {
        const existing = await symptomsRepository.getForUser(symptomsId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Symptoms not found");
        const result = await symptomsRepository.delete(symptomsId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete symptoms");
        await medicalRecordRepository.removeItemByRef(userId, "symptoms", String(existing._id));
        return true;
    }
}
exports.SymptomsService = SymptomsService;
