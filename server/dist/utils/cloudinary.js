"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCloudinaryConfigured = ensureCloudinaryConfigured;
exports.uploadImageBuffer = uploadImageBuffer;
exports.uploadFileBuffer = uploadFileBuffer;
const cloudinary_1 = require("cloudinary");
const path_1 = __importDefault(require("path"));
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const http_status_codes_1 = require("http-status-codes");
const env_1 = require("../config/env");
function ensureCloudinaryConfigured() {
    const cloudName = env_1.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env_1.env.CLOUDINARY_API_KEY;
    const apiSecret = env_1.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
        throw new apiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Cloudinary env vars missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
    }
    cloudinary_1.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
}
async function uploadImageBuffer(buffer, options) {
    ensureCloudinaryConfigured();
    const folder = options?.folder ?? env_1.env.CLOUDINARY_FOLDER;
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: "image",
        }, (error, result) => {
            if (error || !result?.secure_url) {
                return reject(error ??
                    new apiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload image to Cloudinary"));
            }
            resolve({ url: result.secure_url });
        });
        stream.end(buffer);
    });
}
async function uploadFileBuffer(buffer, options) {
    ensureCloudinaryConfigured();
    const folder = options?.folder ?? env_1.env.CLOUDINARY_FOLDER;
    const resourceType = options?.resourceType ?? "auto";
    const fileName = options?.fileName;
    const parsedName = fileName ? path_1.default.parse(fileName) : null;
    const baseName = parsedName?.name;
    const format = options?.format ?? parsedName?.ext?.replace(".", "");
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: false,
            ...(baseName ? { filename_override: baseName } : {}),
            ...(format ? { format } : {}),
        }, (error, result) => {
            if (error || !result?.secure_url || !result.public_id) {
                return reject(error ??
                    new apiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary"));
            }
            resolve({
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type ?? resourceType,
                format: result.format,
            });
        });
        stream.end(buffer);
    });
}
