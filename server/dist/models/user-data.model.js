"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const latestVitalsSchema = new mongoose_1.default.Schema({
    refId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Vitals",
    },
    recordedAt: Date,
    systolicBp: Number,
    diastolicBp: Number,
    glucoseLevel: Number,
    heartRate: Number,
    weight: Number,
    height: Number,
    bmi: Number,
}, { _id: false });
const userDataSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        unique: true,
    },
    fullName: String,
    dob: Date,
    gender: String,
    heightCm: Number,
    weightKg: Number,
    bloodGroup: String,
    phone: String,
    address: String,
    emergencyContact: String,
    latestVitals: {
        type: latestVitalsSchema,
        default: undefined,
    },
}, { timestamps: true });
exports.UserData = mongoose_1.default.model("UserData", userDataSchema);
