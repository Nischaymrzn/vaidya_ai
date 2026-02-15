"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskSymptomsRepository = void 0;
const risk_symptoms_model_1 = require("../models/risk-symptoms.model");
class RiskSymptomsRepository {
    async createMany(data) {
        if (!data.length)
            return [];
        return risk_symptoms_model_1.RiskSymptoms.insertMany(data);
    }
    async getByRisk(riskId) {
        const records = await risk_symptoms_model_1.RiskSymptoms.find({ riskId }).lean();
        return records;
    }
}
exports.RiskSymptomsRepository = RiskSymptomsRepository;
