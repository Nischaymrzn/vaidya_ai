"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskSymptoms = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const riskSymptomsSchema = new mongoose_1.default.Schema({
    riskId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "RiskAssessment",
        required: true,
        index: true,
    },
    symptomsId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Symptoms",
        required: true,
        index: true,
    },
}, { timestamps: true });
exports.RiskSymptoms = mongoose_1.default.model("RiskSymptoms", riskSymptomsSchema);
