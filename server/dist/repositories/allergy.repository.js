"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllergyRepository = void 0;
const allergy_model_1 = require("../models/allergy.model");
class AllergyRepository {
    async create(data) {
        return allergy_model_1.Allergy.create(data);
    }
    async getForUser(id, userId) {
        return allergy_model_1.Allergy.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await allergy_model_1.Allergy.find({ userId })
            .sort({ recordedAt: -1, createdAt: -1 })
            .lean();
        return records;
    }
    async update(id, userId, data) {
        return allergy_model_1.Allergy.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        }).lean();
    }
    async delete(id, userId) {
        const result = await allergy_model_1.Allergy.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
}
exports.AllergyRepository = AllergyRepository;
