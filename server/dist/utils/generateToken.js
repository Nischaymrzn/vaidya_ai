"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function GenerateTokens(payloadData) {
    const payload = {
        id: payloadData.id,
        email: payloadData.email,
        ...(payloadData.role && { role: payloadData.role }),
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.ACCESS_TOKEN_SECRET, {
        expiresIn: env_1.env.ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.REFRESH_TOKEN_SECRET, {
        expiresIn: env_1.env.REFRESH_TOKEN_EXPIRY,
    });
    return { accessToken, refreshToken };
}
exports.default = GenerateTokens;
