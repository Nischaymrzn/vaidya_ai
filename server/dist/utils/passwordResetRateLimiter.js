"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/** Stricter rate limit for password reset emails - 3 per 15 min per IP */
exports.passwordResetRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many reset requests. Try again later." },
});
