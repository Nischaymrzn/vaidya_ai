import rateLimit from "express-rate-limit";

/** Stricter rate limit for password reset emails - 3 per 15 min per IP */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many reset requests. Try again later." },
});
