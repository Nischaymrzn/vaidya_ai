"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthInsight = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const healthInsightSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    insightTitle: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    generatedFromRisk: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "RiskAssessment",
        index: true,
    },
    priority: {
        type: String,
        enum: ["High", "Medium", "Low", "Info"],
        default: "Info",
        index: true,
    },
}, { timestamps: true });
exports.HealthInsight = mongoose_1.default.model("HealthInsight", healthInsightSchema);
