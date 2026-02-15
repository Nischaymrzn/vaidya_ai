"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Symptoms = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const symptomsSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    symptomList: {
        type: [String],
        default: [],
    },
    severity: String,
    durationDays: Number,
    diagnosis: String,
    disease: String,
    notes: String,
    loggedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, { timestamps: true });
exports.Symptoms = mongoose_1.default.model("Symptoms", symptomsSchema);
