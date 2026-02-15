"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportInsightRepository = void 0;
const report_insight_model_1 = require("../models/report-insight.model");
class ReportInsightRepository {
    async createMany(data) {
        if (!data.length)
            return [];
        return report_insight_model_1.ReportInsight.insertMany(data);
    }
}
exports.ReportInsightRepository = ReportInsightRepository;
