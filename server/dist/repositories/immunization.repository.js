"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmunizationRepository = void 0;
const immunization_model_1 = require("../models/immunization.model");
class ImmunizationRepository {
    async create(data) {
        return immunization_model_1.Immunization.create(data);
    }
    async getForUser(id, userId) {
        return immunization_model_1.Immunization.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await immunization_model_1.Immunization.find({ userId })
            .sort({ date: -1, createdAt: -1 })
            .lean();
        return records;
    }
    async update(id, userId, data) {
        return immunization_model_1.Immunization.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        }).lean();
    }
    async delete(id, userId) {
        const result = await immunization_model_1.Immunization.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
}
exports.ImmunizationRepository = ImmunizationRepository;
