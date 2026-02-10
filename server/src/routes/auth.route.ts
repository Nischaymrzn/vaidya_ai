import { Router } from "express";
import passport from "passport";
import { AuthController } from "../controller/auth.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { passwordResetRateLimiter } from "../utils/passwordResetRateLimiter";
import { env } from "../config/env";

const authRouter = Router();
const authcontroller = new AuthController();

authRouter.get("/google/status", (_req, res) => {
  const configured = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  res.json({ success: true, configured });
});

authRouter.get("/google", (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ success: false, message: "Google login is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file. See .env.example for setup." });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err: Error | null, result: { accessToken?: string } | undefined) => {
    if (err) {
      return res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(err.message)}`);
    }
    if (!result?.accessToken) {
      return res.redirect(`${env.CLIENT_URL}/login?error=Google+auth+failed`);
    }
    res.redirect(`${env.CLIENT_URL}/login?token=${result.accessToken}`);
  })(req, res, next);
});

authRouter.post("/login", authcontroller.loginUser);
authRouter.post("/register", authcontroller.createUser);
authRouter.post(
  "/request-password-reset",
  passwordResetRateLimiter,
  authcontroller.sendResetPasswordEmail,
);
authRouter.post("/reset-password/:token", authcontroller.resetPassword);
authRouter.get(
  "/me",
  middlewares.isAuthenticated,
  authcontroller.getCurrentUser,
);

export default authRouter;
