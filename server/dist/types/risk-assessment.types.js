"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessmentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.RiskAssessmentSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    predictedCondition: zod_1.default.string().optional(),
    riskLevel: zod_1.default.enum(["Low", "Medium", "High"]).optional(),
    confidenceScore: zod_1.default.coerce.number().min(0).max(1).optional(),
    riskScore: zod_1.default.coerce.number().min(0).max(100).optional(),
    vaidyaScore: zod_1.default.coerce.number().min(0).max(100).optional(),
    assessmentDate: zod_1.default.coerce.date().optional(),
});
