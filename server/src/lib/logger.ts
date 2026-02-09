import pino from "pino";
import { env } from "../config/env";

const isProd = env.NODE_ENV == "production";
const isTest = env.NODE_ENV == "test";

export const logger = pino({
  level: isTest ? "silent" : isProd ? "info" : "debug",
  transport: !isProd && !isTest ?
    {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname"
      }
    } : undefined
})
