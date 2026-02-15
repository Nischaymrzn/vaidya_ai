"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const riskAssessmentSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    predictedCondition: String,
    riskLevel: {
        type: String,
        enum: ["Low", "Medium", "High"],
        index: true,
    },
    confidenceScore: Number,
    riskScore: Number,
    vaidyaScore: Number,
    assessmentDate: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, { timestamps: true });
exports.RiskAssessment = mongoose_1.default.model("RiskAssessment", riskAssessmentSchema);
