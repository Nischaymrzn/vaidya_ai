"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportInsight = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reportInsightSchema = new mongoose_1.default.Schema({
    reportId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    insightId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "HealthInsight",
        required: true,
        index: true,
    },
}, { timestamps: true });
exports.ReportInsight = mongoose_1.default.model("ReportInsight", reportInsightSchema);
