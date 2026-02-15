"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthInsightRepository = void 0;
const health_insight_model_1 = require("../models/health-insight.model");
class HealthInsightRepository {
    async createMany(data) {
        if (!data.length)
            return [];
        return health_insight_model_1.HealthInsight.insertMany(data);
    }
    async getForUser(id, userId) {
        return health_insight_model_1.HealthInsight.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId, riskId) {
        const query = { userId };
        if (riskId)
            query.generatedFromRisk = riskId;
        const records = await health_insight_model_1.HealthInsight.find(query)
            .sort({ createdAt: -1 })
            .lean();
        return records;
    }
}
exports.HealthInsightRepository = HealthInsightRepository;
