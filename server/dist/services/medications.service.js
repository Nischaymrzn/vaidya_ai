"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationsService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const medications_repository_1 = require("../repositories/medications.repository");
const medicationsRepository = new medications_repository_1.MedicationsRepository();
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
class MedicationsService {
    async createMedication(userId, data) {
        const { recordId, ...payload } = data;
        const medication = await medicationsRepository.create({ ...payload, userId });
        if (!medication)
            throw new apiError_1.default(500, "Failed to create medication");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "medications",
                refId: String(medication._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return medication;
    }
    async getMedicationById(userId, medicationId) {
        const medication = await medicationsRepository.getForUser(medicationId, userId);
        if (!medication)
            throw new apiError_1.default(404, "Medication not found");
        return medication;
    }
    async getAllMedications(userId) {
        return medicationsRepository.getAllForUser(userId);
    }
    async updateMedication(userId, medicationId, data) {
        const existing = await medicationsRepository.getForUser(medicationId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Medication not found");
        const { recordId, ...payload } = data;
        const updated = await medicationsRepository.update(medicationId, userId, payload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update medication");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "medications",
                refId: String(existing._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return updated;
    }
    async deleteMedication(userId, medicationId) {
        const existing = await medicationsRepository.getForUser(medicationId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Medication not found");
        const result = await medicationsRepository.delete(medicationId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete medication");
        await medicalRecordRepository.removeItemByRef(userId, "medications", String(existing._id));
        return true;
    }
}
exports.MedicationsService = MedicationsService;
