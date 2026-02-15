"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessmentRepository = void 0;
const risk_assessment_model_1 = require("../models/risk-assessment.model");
class RiskAssessmentRepository {
    async create(data) {
        return risk_assessment_model_1.RiskAssessment.create(data);
    }
    async getForUser(id, userId) {
        return risk_assessment_model_1.RiskAssessment.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId) {
        const records = await risk_assessment_model_1.RiskAssessment.find({ userId })
            .sort({ assessmentDate: -1, createdAt: -1 })
            .lean();
        return records;
    }
}
exports.RiskAssessmentRepository = RiskAssessmentRepository;
