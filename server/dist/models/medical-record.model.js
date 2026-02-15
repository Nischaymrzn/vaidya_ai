"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecord = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const attachmentSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
    },
    type: {
        type: String,
    },
    name: {
        type: String,
    },
    size: {
        type: Number,
    },
}, { _id: false });
const recordItemSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: [
            "vitals",
            "symptoms",
            "medications",
            "lab_tests",
            "medical_files",
            "allergies",
            "immunizations",
        ],
        required: true,
    },
    refId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
}, { _id: false });
const medicalRecordSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    recordType: {
        type: String,
    },
    category: {
        type: String,
    },
    provider: {
        type: String,
    },
    recordDate: {
        type: Date,
    },
    visitType: {
        type: String,
    },
    diagnosis: {
        type: String,
    },
    content: {
        type: String,
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Verified", "Processed", "Reviewed", "Active"],
        default: "Processed",
    },
    aiScanned: {
        type: Boolean,
        default: false,
    },
    structuredData: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {},
    },
    attachments: {
        type: [attachmentSchema],
        default: [],
    },
    items: {
        type: [recordItemSchema],
        default: [],
    },
    deletedAt: Date,
}, { timestamps: true });
exports.MedicalRecord = mongoose_1.default.model("MedicalRecord", medicalRecordSchema);
