"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const medicalFileSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    url: {
        type: String,
        required: true,
    },
    publicId: String,
    type: String,
    name: String,
    size: Number,
    uploadedAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, { timestamps: true });
exports.MedicalFile = mongoose_1.default.model("MedicalFile", medicalFileSchema);
