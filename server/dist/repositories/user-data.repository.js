"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataRepository = void 0;
const user_data_model_1 = require("../models/user-data.model");
class UserDataRepository {
    async getByUserId(userId) {
        return user_data_model_1.UserData.findOne({ userId }).lean();
    }
    async upsert(userId, update) {
        const updateDoc = update;
        const existingSetOnInsert = typeof updateDoc.$setOnInsert === "object" && updateDoc.$setOnInsert
            ? updateDoc.$setOnInsert
            : {};
        return user_data_model_1.UserData.findOneAndUpdate({ userId }, {
            ...update,
            $setOnInsert: { userId, ...existingSetOnInsert },
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            runValidators: true,
        });
    }
}
exports.UserDataRepository = UserDataRepository;
