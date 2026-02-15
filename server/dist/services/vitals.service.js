"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalsService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const vitals_repository_1 = require("../repositories/vitals.repository");
const user_data_service_1 = require("./user-data.service");
const vitalsRepository = new vitals_repository_1.VitalsRepository();
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
const userDataService = new user_data_service_1.UserDataService();
class VitalsService {
    async createVitals(userId, data) {
        const { recordId, ...payload } = data;
        const vitals = await vitalsRepository.create({ ...payload, userId });
        if (!vitals)
            throw new apiError_1.default(500, "Failed to create vitals");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "vitals",
                refId: String(vitals._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        await userDataService.updateLatestVitals(userId, vitals);
        return vitals;
    }
    async getVitalsById(userId, vitalsId) {
        const vitals = await vitalsRepository.getForUser(vitalsId, userId);
        if (!vitals)
            throw new apiError_1.default(404, "Vitals not found");
        return vitals;
    }
    async getAllVitals(userId) {
        return vitalsRepository.getAllForUser(userId);
    }
    async updateVitals(userId, vitalsId, data) {
        const existing = await vitalsRepository.getForUser(vitalsId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Vitals not found");
        const { recordId, ...payload } = data;
        const updated = await vitalsRepository.update(vitalsId, userId, payload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update vitals");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "vitals",
                refId: String(existing._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        await userDataService.updateLatestVitals(userId, updated ?? existing);
        return updated;
    }
    async deleteVitals(userId, vitalsId) {
        const existing = await vitalsRepository.getForUser(vitalsId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Vitals not found");
        const result = await vitalsRepository.delete(vitalsId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete vitals");
        await medicalRecordRepository.removeItemByRef(userId, "vitals", String(existing._id));
        const latest = await vitalsRepository.getLatestForUser(userId);
        if (latest) {
            await userDataService.updateLatestVitals(userId, latest);
        }
        else {
            await userDataService.updateLatestVitals(userId, null);
        }
        return true;
    }
}
exports.VitalsService = VitalsService;
