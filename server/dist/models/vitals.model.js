"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vitals = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const vitalsSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    systolicBp: Number,
    diastolicBp: Number,
    glucoseLevel: Number,
    heartRate: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    recordedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    notes: String,
}, { timestamps: true });
exports.Vitals = mongoose_1.default.model("Vitals", vitalsSchema);
