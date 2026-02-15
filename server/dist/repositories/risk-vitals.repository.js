"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskVitalsRepository = void 0;
const risk_vitals_model_1 = require("../models/risk-vitals.model");
class RiskVitalsRepository {
    async createMany(data) {
        if (!data.length)
            return [];
        return risk_vitals_model_1.RiskVitals.insertMany(data);
    }
    async getByRisk(riskId) {
        const records = await risk_vitals_model_1.RiskVitals.find({ riskId }).lean();
        return records;
    }
}
exports.RiskVitalsRepository = RiskVitalsRepository;
