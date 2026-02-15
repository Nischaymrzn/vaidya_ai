"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessmentController = void 0;
const zod_1 = __importDefault(require("zod"));
const risk_assessment_service_1 = require("../services/risk-assessment.service");
const risk_assessment_dto_1 = require("../dtos/risk-assessment.dto");
const riskAssessmentService = new risk_assessment_service_1.RiskAssessmentService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
class RiskAssessmentController {
    async generate(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsed = risk_assessment_dto_1.GenerateRiskAssessmentDto.safeParse(req.body ?? {});
            if (!parsed.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsed.error) });
            }
            const result = await riskAssessmentService.generateAssessment(userId, parsed.data);
            return res.status(201).json({
                success: true,
                data: result,
                message: "Risk assessment generated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAssessments(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await riskAssessmentService.getAssessments(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Risk assessments fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAssessmentById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const riskId = req.params.id;
            const result = await riskAssessmentService.getAssessmentById(userId, riskId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Risk assessment fetched",
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
exports.RiskAssessmentController = RiskAssessmentController;
