import { Router } from "express";
import passport from "passport";
import { AuthController } from "../controller/auth.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { passwordResetRateLimiter } from "../utils/passwordResetRateLimiter";
import { env } from "../config/env";

const authRouter = Router();
const authcontroller = new AuthController();

const defaultGoogleRedirect = `${env.CLIENT_URL.replace(/\/$/, "")}/login`;
const allowedGoogleRedirectHosts = new Set(
  env.CLIENT_URLS.flatMap((origin) => {
    try {
      return [new URL(origin).host];
    } catch (_) {
      return [];
    }
  }),
);

function resolveGoogleRedirect(raw?: string): string {
  if (!raw) return defaultGoogleRedirect;

  let candidate = raw;
  try {
    candidate = decodeURIComponent(raw);
  } catch (_) {
    candidate = raw;
  }

  try {
    const url = new URL(candidate);

    if (url.protocol === "vaidya:") {
      return url.toString();
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return defaultGoogleRedirect;
    }

    const isSameHost = allowedGoogleRedirectHosts.has(url.host);
    const isLocalHost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "10.0.2.2";

    if (!isSameHost && !isLocalHost) {
      return defaultGoogleRedirect;
    }

    return url.toString();
  } catch (_) {
    return defaultGoogleRedirect;
  }
}

function buildRedirectUrl(
  baseUrl: string,
  params: Record<string, string>,
): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

authRouter.get("/google/status", (_req, res) => {
  const webOAuthConfigured = !!(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
  );
  const mobileOAuthConfigured = !!(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_ANDROID_CLIENT_ID
  );
  const configured = webOAuthConfigured || mobileOAuthConfigured;
  res.json({ success: true, configured });
});

authRouter.get("/google", (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message:
        "Google login is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file. See .env.example for setup.",
    });
  }
  const redirectUri = resolveGoogleRedirect(
    typeof req.query.redirect_uri === "string"
      ? req.query.redirect_uri
      : undefined,
  );
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: encodeURIComponent(redirectUri),
  })(req, res, next);
});

authRouter.get("/google/callback", (req, res, next) => {
  const redirectUri = resolveGoogleRedirect(
    typeof req.query.state === "string" ? req.query.state : undefined,
  );
  passport.authenticate(
    "google",
    (err: Error | null, result: { accessToken?: string } | undefined) => {
      if (err) {
        return res.redirect(
          buildRedirectUrl(redirectUri, { error: err.message }),
        );
      }
      if (!result?.accessToken) {
        return res.redirect(
          buildRedirectUrl(redirectUri, { error: "Google auth failed" }),
        );
      }
      res.redirect(
        buildRedirectUrl(redirectUri, { token: result.accessToken }),
      );
    },
  )(req, res, next);
});

authRouter.post("/login", authcontroller.loginUser);
authRouter.post("/google/mobile", authcontroller.googleMobileLogin);
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
