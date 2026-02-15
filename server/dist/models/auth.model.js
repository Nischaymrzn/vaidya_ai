"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    number: {
        type: String,
    },
    password: {
        type: String,
        select: false,
    },
    profilePicture: { type: String, required: false },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true,
    },
    deletedAt: Date,
}, { timestamps: true });
exports.User = mongoose_1.default.model("User", userSchema);
