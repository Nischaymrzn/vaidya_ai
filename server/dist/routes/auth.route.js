"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controller/auth.controller");
const authorization_middleware_1 = require("../middlewares/authorization.middleware");
const passwordResetRateLimiter_1 = require("../utils/passwordResetRateLimiter");
const env_1 = require("../config/env");
const authRouter = (0, express_1.Router)();
const authcontroller = new auth_controller_1.AuthController();
authRouter.get("/google/status", (_req, res) => {
    const configured = !!(env_1.env.GOOGLE_CLIENT_ID && env_1.env.GOOGLE_CLIENT_SECRET);
    res.json({ success: true, configured });
});
authRouter.get("/google", (req, res, next) => {
    if (!env_1.env.GOOGLE_CLIENT_ID || !env_1.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({ success: false, message: "Google login is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file. See .env.example for setup." });
    }
    passport_1.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
authRouter.get("/google/callback", (req, res, next) => {
    passport_1.default.authenticate("google", (err, result) => {
        if (err) {
            return res.redirect(`${env_1.env.CLIENT_URL}/login?error=${encodeURIComponent(err.message)}`);
        }
        if (!result?.accessToken) {
            return res.redirect(`${env_1.env.CLIENT_URL}/login?error=Google+auth+failed`);
        }
        res.redirect(`${env_1.env.CLIENT_URL}/login?token=${result.accessToken}`);
    })(req, res, next);
});
authRouter.post("/login", authcontroller.loginUser);
authRouter.post("/register", authcontroller.createUser);
authRouter.post("/request-password-reset", passwordResetRateLimiter_1.passwordResetRateLimiter, authcontroller.sendResetPasswordEmail);
authRouter.post("/reset-password/:token", authcontroller.resetPassword);
authRouter.get("/me", authorization_middleware_1.middlewares.isAuthenticated, authcontroller.getCurrentUser);
exports.default = authRouter;
