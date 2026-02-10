import dotenv from "dotenv";
import type { StringValue } from "ms";

dotenv.config();

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  MONGODB_URI: requiredEnv("MONGODB_URI"),
  SECRET_KEY: requiredEnv("SECRET_KEY"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? "3000",
  VERSION: process.env.VERSION ?? "v1",
  ACCESS_TOKEN_SECRET: requiredEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: requiredEnv("REFRESH_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRY: requiredEnv("ACCESS_TOKEN_EXPIRY") as StringValue,
  REFRESH_TOKEN_EXPIRY: requiredEnv("REFRESH_TOKEN_EXPIRY") as StringValue,
  PASSWORD_RESET_SECRET: requiredEnv("PASSWORD_RESET_SECRET"),
  PASSWORD_RESET_EXPIRY:
    (process.env.PASSWORD_RESET_EXPIRY as StringValue) ?? "1h",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
  SERVER_URL: process.env.SERVER_URL ?? process.env.API_URL ?? "http://localhost:5000",
  SMTP_HOST: requiredEnv("SMTP_HOST"),
  SMTP_PORT: Number(process.env.SMTP_PORT ?? "587"),
  SMTP_USER: requiredEnv("SMTP_USER"),
  SMTP_PASS: requiredEnv("SMTP_PASS"),
  SMTP_FROM: requiredEnv("SMTP_FROM"),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER ?? "vaidya",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
};
