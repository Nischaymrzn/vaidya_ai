"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllergyService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const allergy_repository_1 = require("../repositories/allergy.repository");
const notification_service_1 = require("./notification.service");
const allergyRepository = new allergy_repository_1.AllergyRepository();
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
const notificationService = new notification_service_1.NotificationService();
class AllergyService {
    async createAllergy(userId, data) {
        const { recordId, ...payload } = data;
        const allergy = await allergyRepository.create({ ...payload, userId });
        if (!allergy)
            throw new apiError_1.default(500, "Failed to create allergy");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "allergies",
                refId: String(allergy._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        try {
            await notificationService.createNotification(userId, {
                type: "allergy_added",
                title: "Allergy added",
                message: `Allergy recorded: ${allergy.allergen}.`,
                data: { allergyId: String(allergy._id) },
            });
        }
        catch {
            // Best-effort notification; do not block creation.
        }
        return allergy;
    }
    async getAllergyById(userId, allergyId) {
        const allergy = await allergyRepository.getForUser(allergyId, userId);
        if (!allergy)
            throw new apiError_1.default(404, "Allergy not found");
        return allergy;
    }
    async getAllAllergies(userId) {
        return allergyRepository.getAllForUser(userId);
    }
    async updateAllergy(userId, allergyId, data) {
        const existing = await allergyRepository.getForUser(allergyId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Allergy not found");
        const { recordId, ...payload } = data;
        const updated = await allergyRepository.update(allergyId, userId, payload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update allergy");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "allergies",
                refId: String(existing._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return updated;
    }
    async deleteAllergy(userId, allergyId) {
        const existing = await allergyRepository.getForUser(allergyId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Allergy not found");
        const result = await allergyRepository.delete(allergyId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete allergy");
        await medicalRecordRepository.removeItemByRef(userId, "allergies", String(existing._id));
        return true;
    }
}
exports.AllergyService = AllergyService;
