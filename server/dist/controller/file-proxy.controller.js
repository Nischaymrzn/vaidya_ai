"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProxyController = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const http_status_codes_1 = require("http-status-codes");
const env_1 = require("../config/env");
const cloudinary_1 = require("cloudinary");
const cloudinary_2 = require("../utils/cloudinary");
const CLOUDINARY_HOST = "res.cloudinary.com";
function getSafeFilename(url, fallback = "file") {
    const rawName = decodeURIComponent(url.pathname.split("/").pop() || "");
    const trimmed = rawName.trim();
    if (!trimmed)
        return fallback;
    return trimmed.replace(/[\\/:*?"<>|]+/g, "_");
}
function resolveCloudinaryUrl(value) {
    try {
        const parsed = new URL(value);
        if (parsed.protocol !== "https:")
            return null;
        if (parsed.hostname !== CLOUDINARY_HOST)
            return null;
        const cloudName = env_1.env.CLOUDINARY_CLOUD_NAME;
        if (!cloudName)
            return null;
        if (!parsed.pathname.startsWith(`/${cloudName}/`))
            return null;
        return parsed;
    }
    catch {
        return null;
    }
}
function parseCloudinaryAsset(url) {
    const cloudName = env_1.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName)
        return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== cloudName)
        return null;
    const resourceType = parts[1] || "image";
    const deliveryType = parts[2] || "upload";
    const versionIndex = parts.findIndex((part, index) => index > 2 && /^v\d+$/.test(part));
    const publicIdParts = versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts.slice(3);
    if (!publicIdParts.length)
        return null;
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
class FileProxyController {
    async getFile(req, res) {
        try {
            const urlParam = typeof req.query.url === "string" ? req.query.url : "";
            if (!urlParam) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "url is required",
                });
            }
            const cloudinaryUrl = resolveCloudinaryUrl(urlParam);
            if (!cloudinaryUrl) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid url",
                });
            }
            const download = req.query.download === "1" || req.query.download === "true";
            (0, cloudinary_2.ensureCloudinaryConfigured)();
            const asset = parseCloudinaryAsset(cloudinaryUrl);
            const signedUrl = asset
                ? cloudinary_1.v2.utils.private_download_url(asset.publicId, asset.format || "pdf", {
                    resource_type: asset.resourceType,
                    type: asset.deliveryType,
                    attachment: download,
                })
                : cloudinaryUrl.toString();
            const response = await fetch(signedUrl);
            if (!response.ok) {
                throw new apiError_1.default(response.status, `Failed to fetch file: ${response.statusText}`);
            }
            const contentType = response.headers.get("content-type") ?? "application/octet-stream";
            const fileName = typeof req.query.name === "string" && req.query.name.trim().length
                ? req.query.name.trim()
                : getSafeFilename(cloudinaryUrl, "attachment");
            const buffer = Buffer.from(await response.arrayBuffer());
            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${fileName}"`);
            res.setHeader("Cache-Control", "private, max-age=0, no-store");
            return res.status(http_status_codes_1.StatusCodes.OK).send(buffer);
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.FileProxyController = FileProxyController;
