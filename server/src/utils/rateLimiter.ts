import rateLimit from "express-rate-limit";

const isLocalRequest = (ip?: string) => {
  if (!ip) return false;
  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.includes("::ffff:127.0.0.1") ||
    ip.includes("localhost")
  );
};

const shouldSkipRateLimit = (ip?: string) => {
  if (process.env.NODE_ENV === "test") return true;
  // Keep rate limiting in production, but avoid blocking local E2E/dev runs.
  if (process.env.NODE_ENV !== "production" && isLocalRequest(ip)) return true;
  return false;
};

const rateLimiter = rateLimit({
  limit: 100,
  windowMs: 15 * 60 * 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  skip: (req) => shouldSkipRateLimit(req.ip),
});

export default rateLimiter;
