"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymptomsRepository = void 0;
const symptoms_model_1 = require("../models/symptoms.model");
class SymptomsRepository {
    async create(data) {
        return symptoms_model_1.Symptoms.create(data);
    }
    async getForUser(id, userId) {
        return symptoms_model_1.Symptoms.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await symptoms_model_1.Symptoms.find({ userId })
            .sort({ loggedAt: -1, createdAt: -1 })
            .lean();
        return records;
    }
    async getLatestForUser(userId) {
        return symptoms_model_1.Symptoms.findOne({ userId })
            .sort({ loggedAt: -1, createdAt: -1 })
            .lean();
    }
    async update(id, userId, data) {
        return symptoms_model_1.Symptoms.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        }).lean();
    }
    async delete(id, userId) {
        const result = await symptoms_model_1.Symptoms.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
}
exports.SymptomsRepository = SymptomsRepository;
