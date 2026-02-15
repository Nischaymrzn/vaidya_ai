import { Request, Response } from "express";
import z from "zod";
import {
  CreateMedicalFileDto,
  UpdateMedicalFileDto,
} from "../dtos/medical-file.dto";
import { MedicalFileService } from "../services/medical-file.service";
import { env } from "../config/env";
import { uploadFileBuffer } from "../utils/cloudinary";

const medicalFileService = new MedicalFileService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

async function buildFile(req: Request) {
  const file = req.file;
  if (!file) return null;

  const isPdf = file.mimetype === "application/pdf";
  const resourceType = isPdf ? "raw" : "image";
  const { url, publicId } = await uploadFileBuffer(file.buffer, {
    folder: `${env.CLOUDINARY_FOLDER}/medical-files`,
    resourceType,
    fileName: file.originalname,
    format: isPdf ? "pdf" : undefined,
  });

  return {
    url,
    publicId,
    type: file.mimetype,
    name: file.originalname,
    size: file.size,
  };
}

function normalizePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload };
  if (normalized.uploadedAt === "") {
    delete normalized.uploadedAt;
  }
  if (normalized.recordId === "") {
    delete normalized.recordId;
  }
  return normalized;
}

export class MedicalFileController {
  async createMedicalFile(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateMedicalFileDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const fileMeta = await buildFile(req);
      const url = fileMeta?.url ?? parsedData.data.url;
      if (!url) {
        return res.status(400).json({
          success: false,
          message: "File upload or url is required",
        });
      }

      const medicalFile = await medicalFileService.createMedicalFile(userId, {
        ...parsedData.data,
        ...fileMeta,
        url,
      });

      return res.status(201).json({
        success: true,
        data: medicalFile,
        message: "Medical file created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMedicalFileById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const fileId = req.params.id;
      const medicalFile = await medicalFileService.getMedicalFileById(
        userId,
        fileId,
      );
      return res.status(200).json({
        success: true,
        data: medicalFile,
        message: "Medical file fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllMedicalFiles(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await medicalFileService.getAllMedicalFiles(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Medical files fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateMedicalFile(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateMedicalFileDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const fileId = req.params.id;
      const updated = await medicalFileService.updateMedicalFile(
        userId,
        fileId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Medical file updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteMedicalFile(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const fileId = req.params.id;
      await medicalFileService.deleteMedicalFile(userId, fileId);
      return res
        .status(200)
        .json({ success: true, message: "Medical file deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
