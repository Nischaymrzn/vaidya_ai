"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordRepository = void 0;
const medical_record_model_1 = require("../models/medical-record.model");
class MedicalRecordRepository {
    async createRecord(data) {
        return medical_record_model_1.MedicalRecord.create(data);
    }
    async getRecordForUser(id, userId) {
        return medical_record_model_1.MedicalRecord.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(100, Math.max(1, options?.limit ?? 10));
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
            medical_record_model_1.MedicalRecord.find({ userId })
                .sort({ recordDate: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            medical_record_model_1.MedicalRecord.countDocuments({ userId }),
        ]);
        return {
            data: records,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async updateRecord(id, userId, data) {
        const updatedRecord = await medical_record_model_1.MedicalRecord.findOneAndUpdate({ _id: id, userId }, data, { new: true }).lean();
        return updatedRecord;
    }
    async deleteRecord(id, userId) {
        const result = await medical_record_model_1.MedicalRecord.findOneAndDelete({ _id: id, userId });
        return result ? true : null;
    }
    async addItem(id, userId, item) {
        return medical_record_model_1.MedicalRecord.findOneAndUpdate({ _id: id, userId }, { $addToSet: { items: item } }, { new: true }).lean();
    }
    async removeItemByRef(userId, type, refId) {
        const result = await medical_record_model_1.MedicalRecord.updateMany({ userId }, { $pull: { items: { type, refId } } });
        return result.acknowledged ?? false;
    }
}
exports.MedicalRecordRepository = MedicalRecordRepository;
