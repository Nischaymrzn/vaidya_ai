"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Medications = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const medicationsSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    medicineName: {
        type: String,
        required: true,
    },
    dosage: String,
    frequency: String,
    durationDays: Number,
    startDate: {
        type: Date,
        index: true,
    },
    endDate: Date,
    purpose: String,
    diagnosis: String,
    disease: String,
    notes: String,
}, { timestamps: true });
exports.Medications = mongoose_1.default.model("Medications", medicationsSchema);
