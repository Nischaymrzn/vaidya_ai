"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFileRepository = void 0;
const medical_file_model_1 = require("../models/medical-file.model");
class MedicalFileRepository {
    async create(data) {
        return medical_file_model_1.MedicalFile.create(data);
    }
    async getForUser(id, userId) {
        return medical_file_model_1.MedicalFile.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await medical_file_model_1.MedicalFile.find({ userId })
            .sort({ uploadedAt: -1, createdAt: -1 })
            .lean();
        return records;
    }
    async update(id, userId, data) {
        return medical_file_model_1.MedicalFile.findOneAndUpdate({ _id: id, userId }, data, {
            new: true,
        }).lean();
    }
    async delete(id, userId) {
        const result = await medical_file_model_1.MedicalFile.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
}
exports.MedicalFileRepository = MedicalFileRepository;
