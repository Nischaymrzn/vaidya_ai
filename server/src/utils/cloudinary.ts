import { v2 as cloudinary } from "cloudinary";
import path from "path";
import ApiError from "../exceptions/apiError";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";

export function ensureCloudinaryConfigured() {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Cloudinary env vars missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  options?: { folder?: string },
): Promise<{ url: string }> {
  ensureCloudinaryConfigured();

  const folder = options?.folder ?? env.CLOUDINARY_FOLDER;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          return reject(
            error ??
              new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to upload image to Cloudinary",
              ),
          );
        }
        resolve({ url: result.secure_url });
      },
    );

    stream.end(buffer);
  });
}

type UploadResourceType = "image" | "raw" | "auto";

export async function uploadFileBuffer(
  buffer: Buffer,
  options?: {
    folder?: string;
    resourceType?: UploadResourceType;
    fileName?: string;
    format?: string;
  },
): Promise<{
  url: string;
  publicId: string;
  resourceType: string;
  format?: string;
}> {
  ensureCloudinaryConfigured();

  const folder = options?.folder ?? env.CLOUDINARY_FOLDER;
  const resourceType = options?.resourceType ?? "auto";
  const fileName = options?.fileName;
  const parsedName = fileName ? path.parse(fileName) : null;
  const baseName = parsedName?.name;
  const format = options?.format ?? parsedName?.ext?.replace(".", "");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: false,
        ...(baseName ? { filename_override: baseName } : {}),
        ...(format ? { format } : {}),
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          return reject(
            error ??
              new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to upload file to Cloudinary",
              ),
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type ?? resourceType,
          format: result.format,
        });
      },
    );

    stream.end(buffer);
  });
}

