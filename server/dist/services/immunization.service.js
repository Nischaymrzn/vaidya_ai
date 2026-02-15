"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmunizationService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const immunization_repository_1 = require("../repositories/immunization.repository");
const notification_service_1 = require("./notification.service");
const immunizationRepository = new immunization_repository_1.ImmunizationRepository();
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
const notificationService = new notification_service_1.NotificationService();
class ImmunizationService {
    async createImmunization(userId, data) {
        const { recordId, ...payload } = data;
        const immunization = await immunizationRepository.create({
            ...payload,
            userId,
        });
        if (!immunization)
            throw new apiError_1.default(500, "Failed to create immunization");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "immunizations",
                refId: String(immunization._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        try {
            await notificationService.createNotification(userId, {
                type: "immunization_added",
                title: "Immunization added",
                message: `Immunization recorded: ${immunization.vaccineName}.`,
                data: { immunizationId: String(immunization._id) },
            });
        }
        catch {
            // Best-effort notification; do not block creation.
        }
        return immunization;
    }
    async getImmunizationById(userId, immunizationId) {
        const immunization = await immunizationRepository.getForUser(immunizationId, userId);
        if (!immunization)
            throw new apiError_1.default(404, "Immunization not found");
        return immunization;
    }
    async getAllImmunizations(userId) {
        return immunizationRepository.getAllForUser(userId);
    }
    async updateImmunization(userId, immunizationId, data) {
        const existing = await immunizationRepository.getForUser(immunizationId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Immunization not found");
        const { recordId, ...payload } = data;
        const updated = await immunizationRepository.update(immunizationId, userId, payload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update immunization");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "immunizations",
                refId: String(existing._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return updated;
    }
    async deleteImmunization(userId, immunizationId) {
        const existing = await immunizationRepository.getForUser(immunizationId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Immunization not found");
        const result = await immunizationRepository.delete(immunizationId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete immunization");
        await medicalRecordRepository.removeItemByRef(userId, "immunizations", String(existing._id));
        return true;
    }
}
exports.ImmunizationService = ImmunizationService;
