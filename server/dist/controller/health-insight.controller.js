"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthInsightController = void 0;
const health_insight_service_1 = require("../services/health-insight.service");
const healthInsightService = new health_insight_service_1.HealthInsightService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
class HealthInsightController {
    async getInsights(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const riskId = typeof req.query?.riskId === "string" ? req.query.riskId : undefined;
            const insights = await healthInsightService.getInsights(userId, riskId);
            return res.status(200).json({
                success: true,
                data: insights,
                message: "Insights fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getInsightById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const insightId = req.params.id;
            const insight = await healthInsightService.getInsightById(userId, insightId);
            return res.status(200).json({
                success: true,
                data: insight,
                message: "Insight fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.HealthInsightController = HealthInsightController;
