"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataService = void 0;
const user_data_repository_1 = require("../repositories/user-data.repository");
const userDataRepository = new user_data_repository_1.UserDataRepository();
class UserDataService {
    async getUserData(userId) {
        return userDataRepository.getByUserId(userId);
    }
    async updateUserData(userId, data) {
        if (!Object.keys(data).length) {
            return userDataRepository.getByUserId(userId);
        }
        return userDataRepository.upsert(userId, { $set: data });
    }
    async updateLatestVitals(userId, vitals) {
        if (!vitals) {
            return userDataRepository.upsert(userId, {
                $unset: { latestVitals: "" },
            });
        }
        const latestVitals = {
            refId: vitals._id,
            recordedAt: vitals.recordedAt ?? vitals.createdAt,
            systolicBp: vitals.systolicBp,
            diastolicBp: vitals.diastolicBp,
            glucoseLevel: vitals.glucoseLevel,
            heartRate: vitals.heartRate,
            weight: vitals.weight,
            height: vitals.height,
            bmi: vitals.bmi,
        };
        const updateFields = {
            latestVitals,
        };
        if (typeof vitals.weight === "number") {
            updateFields.weightKg = vitals.weight;
        }
        if (typeof vitals.height === "number") {
            updateFields.heightCm = vitals.height;
        }
        return userDataRepository.upsert(userId, {
            $set: updateFields,
            $setOnInsert: { userId },
        });
    }
}
exports.UserDataService = UserDataService;
