"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabTestService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const lab_test_repository_1 = require("../repositories/lab-test.repository");
const labTestRepository = new lab_test_repository_1.LabTestRepository();
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
class LabTestService {
    async createLabTest(userId, data) {
        const { recordId, ...payload } = data;
        const labTest = await labTestRepository.create({ ...payload, userId });
        if (!labTest)
            throw new apiError_1.default(500, "Failed to create lab test");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "lab_tests",
                refId: String(labTest._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return labTest;
    }
    async getLabTestById(userId, labTestId) {
        const labTest = await labTestRepository.getForUser(labTestId, userId);
        if (!labTest)
            throw new apiError_1.default(404, "Lab test not found");
        return labTest;
    }
    async getAllLabTests(userId) {
        return labTestRepository.getAllForUser(userId);
    }
    async updateLabTest(userId, labTestId, data) {
        const existing = await labTestRepository.getForUser(labTestId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Lab test not found");
        const { recordId, ...payload } = data;
        const updated = await labTestRepository.update(labTestId, userId, payload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update lab test");
        if (recordId) {
            const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
                type: "lab_tests",
                refId: String(existing._id),
            });
            if (!updatedRecord)
                throw new apiError_1.default(404, "Medical record not found");
        }
        return updated;
    }
    async deleteLabTest(userId, labTestId) {
        const existing = await labTestRepository.getForUser(labTestId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Lab test not found");
        const result = await labTestRepository.delete(labTestId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete lab test");
        await medicalRecordRepository.removeItemByRef(userId, "lab_tests", String(existing._id));
        return true;
    }
}
exports.LabTestService = LabTestService;
