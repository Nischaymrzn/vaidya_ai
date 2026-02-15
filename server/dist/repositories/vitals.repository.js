"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalsRepository = void 0;
const vitals_model_1 = require("../models/vitals.model");
class VitalsRepository {
    async create(data) {
        return vitals_model_1.Vitals.create(data);
    }
    async getForUser(id, userId) {
        return vitals_model_1.Vitals.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await vitals_model_1.Vitals.find({ userId })
            .sort({ recordedAt: -1, createdAt: -1 })
            .lean();
        return records;
    }
    async getLatestForUser(userId) {
        return vitals_model_1.Vitals.findOne({ userId })
            .sort({ recordedAt: -1, createdAt: -1 })
            .lean();
    }
    async update(id, userId, data) {
        return vitals_model_1.Vitals.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        }).lean();
    }
    async delete(id, userId) {
        const result = await vitals_model_1.Vitals.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
}
exports.VitalsRepository = VitalsRepository;
