"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationsRepository = void 0;
const medications_model_1 = require("../models/medications.model");
class MedicationsRepository {
    async create(data) {
        return medications_model_1.Medications.create(data);
    }
    async getForUser(id, userId) {
        return medications_model_1.Medications.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await medications_model_1.Medications.find({ userId })
            .sort({ startDate: -1, createdAt: -1 })
            .lean();
        return records;
    }
    async getLatestForUser(userId) {
        return medications_model_1.Medications.findOne({ userId })
            .sort({ startDate: -1, createdAt: -1 })
            .lean();
    }
    async update(id, userId, data) {
        return medications_model_1.Medications.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        }).lean();
    }
    async delete(id, userId) {
        const result = await medications_model_1.Medications.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
}
exports.MedicationsRepository = MedicationsRepository;
