"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Allergy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const allergySchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    allergen: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["food", "drug", "environmental", "other"],
    },
    reaction: String,
    severity: {
        type: String,
        enum: ["mild", "moderate", "severe"],
    },
    status: {
        type: String,
        enum: ["active", "resolved"],
        default: "active",
    },
    onsetDate: Date,
    recordedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    notes: String,
}, { timestamps: true });
exports.Allergy = mongoose_1.default.model("Allergy", allergySchema);
