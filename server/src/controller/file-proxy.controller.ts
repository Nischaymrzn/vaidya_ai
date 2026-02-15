import { Request, Response } from "express";
import ApiError from "../exceptions/apiError";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import { v2 as cloudinary } from "cloudinary";
import { ensureCloudinaryConfigured } from "../utils/cloudinary";

const CLOUDINARY_HOST = "res.cloudinary.com";

function getSafeFilename(url: URL, fallback = "file") {
  const rawName = decodeURIComponent(url.pathname.split("/").pop() || "");
  const trimmed = rawName.trim();
  if (!trimmed) return fallback;
  return trimmed.replace(/[\\/:*?"<>|]+/g, "_");
}

function resolveCloudinaryUrl(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return null;
    if (parsed.hostname !== CLOUDINARY_HOST) return null;
    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return null;
    if (!parsed.pathname.startsWith(`/${cloudName}/`)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseCloudinaryAsset(url: URL) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== cloudName) return null;
  const resourceType = parts[1] || "image";
  const deliveryType = parts[2] || "upload";
  const versionIndex = parts.findIndex(
    (part, index) => index > 2 && /^v\d+$/.test(part),
  );
  const publicIdParts =
    versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts.slice(3);
  if (!publicIdParts.length) return null;
  const last = publicIdParts[publicIdParts.length - 1];
  const dotIndex = last.lastIndexOf(".");
  let format = "";
  if (dotIndex > 0) {
    format = last.slice(dotIndex + 1);
    publicIdParts[publicIdParts.length - 1] = last.slice(0, dotIndex);
  }
  const publicId = publicIdParts.join("/");
  return { publicId, format, resourceType, deliveryType };
}

export class FileProxyController {
  async getFile(req: Request, res: Response) {
    try {
      const urlParam =
        typeof req.query.url === "string" ? req.query.url : "";
      if (!urlParam) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "url is required",
        });
      }

      const cloudinaryUrl = resolveCloudinaryUrl(urlParam);
      if (!cloudinaryUrl) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Invalid url",
        });
      }

      const download =
        req.query.download === "1" || req.query.download === "true";

      ensureCloudinaryConfigured();

      const asset = parseCloudinaryAsset(cloudinaryUrl);
      const signedUrl = asset
        ? cloudinary.utils.private_download_url(
            asset.publicId,
            asset.format || "pdf",
            {
              resource_type: asset.resourceType as "image" | "raw" | "video",
              type: asset.deliveryType as "upload" | "private" | "authenticated",
              attachment: download,
            },
          )
        : cloudinaryUrl.toString();

      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new ApiError(
          response.status,
          `Failed to fetch file: ${response.statusText}`,
        );
      }

      const contentType =
        response.headers.get("content-type") ?? "application/octet-stream";
      const fileName =
        typeof req.query.name === "string" && req.query.name.trim().length
          ? req.query.name.trim()
          : getSafeFilename(cloudinaryUrl, "attachment");

      const buffer = Buffer.from(await response.arrayBuffer());
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      );
      res.setHeader("Cache-Control", "private, max-age=0, no-store");
      return res.status(StatusCodes.OK).send(buffer);
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
