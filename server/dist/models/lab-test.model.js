"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabTest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const labTestSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    testName: {
        type: String,
        required: true,
    },
    resultValue: String,
    normalRange: String,
    unit: String,
    testedDate: {
        type: Date,
        index: true,
    },
    reportFileId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
    },
    notes: String,
}, { timestamps: true });
exports.LabTest = mongoose_1.default.model("LabTest", labTestSchema);
