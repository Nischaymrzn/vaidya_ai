"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabTestRepository = void 0;
const lab_test_model_1 = require("../models/lab-test.model");
class LabTestRepository {
    async create(data) {
        return lab_test_model_1.LabTest.create(data);
    }
    async getForUser(id, userId) {
        return lab_test_model_1.LabTest.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await lab_test_model_1.LabTest.find({ userId })
            .sort({ testedDate: -1, createdAt: -1 })
            .lean();
        return records;
    }
    async getLatestForUser(userId) {
        return lab_test_model_1.LabTest.findOne({ userId })
            .sort({ testedDate: -1, createdAt: -1 })
            .lean();
    }
    async update(id, userId, data) {
        return lab_test_model_1.LabTest.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        }).lean();
    }
    async delete(id, userId) {
        const result = await lab_test_model_1.LabTest.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
}
exports.LabTestRepository = LabTestRepository;
