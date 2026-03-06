import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import type { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db";
import { configurePassport } from "./config/passport";
import rateLimiter from "./utils/rateLimiter";
import mainRouter from "./routes";
import { env } from "./config/env";
import { httpLogger } from "./lib/http-logger";
import { logger } from "./lib/logger";
import path from "path";
import { diseasePredictionService } from "./services/disease-prediction.service";

const app: Application = express();

const allowedCorsOrigins = Array.from(
  new Set(
    [
      ...env.CLIENT_URL.split(",").map((origin) => origin.trim()),
      ...(env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
    ].filter(Boolean),
  ),
);

app.use(rateLimiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, allowedCorsOrigins.includes(origin));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      const requestUrl = (req as any).originalUrl ?? req.url ?? "";
      if (requestUrl.includes("/payments/webhook")) {
        (req as any).rawBody = buf;
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

configurePassport();
app.use(passport.initialize());

app.use(`/${env.VERSION}/api/`, mainRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Vaidya api!");
});

void diseasePredictionService.init().catch((error) => {
  logger.error({ error }, "Failed to initialize disease prediction model");
});

connectDB();

app.use(httpLogger);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  logger.error(err);

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
