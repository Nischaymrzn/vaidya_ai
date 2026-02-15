"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Immunization = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const immunizationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    vaccineName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        index: true,
    },
    doseNumber: Number,
    series: String,
    manufacturer: String,
    lotNumber: String,
    site: String,
    route: String,
    provider: String,
    nextDue: Date,
    notes: String,
}, { timestamps: true });
exports.Immunization = mongoose_1.default.model("Immunization", immunizationSchema);
