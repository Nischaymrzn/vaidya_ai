"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskVitals = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const riskVitalsSchema = new mongoose_1.default.Schema({
    riskId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "RiskAssessment",
        required: true,
        index: true,
    },
    vitalsId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Vitals",
        required: true,
        index: true,
    },
}, { timestamps: true });
exports.RiskVitals = mongoose_1.default.model("RiskVitals", riskVitalsSchema);
