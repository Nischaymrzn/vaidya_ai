"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewares = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const env_1 = require("../config/env");
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errorMessages_1 = __importDefault(require("../constants/errorMessages"));
const user_repository_1 = require("../repositories/user.repository");
const userRepository = new user_repository_1.UserRepository();
const isAuthenticated = (0, asyncHandler_1.default)(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new apiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorMessages_1.default.USER.UNAUTHORIZED);
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new apiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorMessages_1.default.TOKEN.NOT_FOUND);
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, env_1.env.ACCESS_TOKEN_SECRET);
    }
    catch (_err) {
        throw new apiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorMessages_1.default.TOKEN.INVALID_TOKEN);
    }
    if (!decoded || !decoded.id) {
        throw new apiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorMessages_1.default.TOKEN.INVALID_TOKEN);
    }
    const user = await userRepository.getUserById(decoded.id);
    if (!user)
        throw new apiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorMessages_1.default.TOKEN.TOKEN_USER_NOT_FOUND);
    req.user = user;
    return next();
});
const adminOnlyMiddleware = (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            next();
        }
        else {
            throw new apiError_1.default(403, "Forbidden, Admins only");
        }
    }
    catch (error) {
        return res.status(error.statusCode || 403).json({ success: false, message: error.message || "Forbidden" });
    }
};
const userOnlyMiddleware = (req, res, next) => {
    try {
        if (req.user && req.user.role !== "admin") {
            next();
        }
        else {
            throw new apiError_1.default(403, "Forbidden, Users only");
        }
    }
    catch (error) {
        return res.status(error.statusCode || 403).json({ success: false, message: error.message || "Forbidden" });
    }
};
exports.middlewares = { isAuthenticated, adminOnlyMiddleware, userOnlyMiddleware };
