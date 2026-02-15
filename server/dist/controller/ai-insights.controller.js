"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsightsController = void 0;
const ai_insights_service_1 = require("../services/ai-insights.service");
const aiInsightsService = new ai_insights_service_1.AiInsightsService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
class AiInsightsController {
    async generate(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const input = typeof req.body?.input === "string" ? req.body.input : "";
            const maxItems = Number(req.body?.maxItems ?? 3);
            if (!input.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "input is required",
                });
            }
            const insights = await aiInsightsService.generateInsights(input, maxItems);
            return res.status(200).json({
                success: true,
                data: insights,
                message: "Insights generated",
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
exports.AiInsightsController = AiInsightsController;
