"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthInsightService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const health_insight_repository_1 = require("../repositories/health-insight.repository");
const healthInsightRepository = new health_insight_repository_1.HealthInsightRepository();
class HealthInsightService {
    async getInsights(userId, riskId) {
        return healthInsightRepository.getAllForUser(userId, riskId);
    }
    async getInsightById(userId, insightId) {
        const insight = await healthInsightRepository.getForUser(insightId, userId);
        if (!insight)
            throw new apiError_1.default(404, "Insight not found");
        return insight;
    }
}
exports.HealthInsightService = HealthInsightService;
