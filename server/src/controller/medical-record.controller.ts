import { Request, Response } from "express";
import z from "zod";
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
} from "../dtos/medical-record.dto";
import { env } from "../config/env";
import { uploadFileBuffer } from "../utils/cloudinary";
import { MedicalRecordService } from "../services/medical-record.service";
import { MedicalRecordAttachment } from "../types/medical-record.types";

const medicalRecordService = new MedicalRecordService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

async function buildAttachments(
  req: Request,
): Promise<MedicalRecordAttachment[]> {
  const files = Array.isArray(req.files)
    ? req.files
    : req.file
      ? [req.file]
      : [];
  if (!files.length) return [];

  const uploads = await Promise.all(
    files.map(async (file) => {
      const isPdf = file.mimetype === "application/pdf";
      const resourceType = isPdf ? "raw" : "image";
      const { url, publicId } = await uploadFileBuffer(file.buffer, {
        folder: `${env.CLOUDINARY_FOLDER}/medical-records`,
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
    }),
  );

  return uploads;
}

function normalizePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload };
  if (!normalized.recordDate && normalized.date) {
    normalized.recordDate = normalized.date;
    delete normalized.date;
  }
  if (normalized.recordDate === "") {
    delete normalized.recordDate;
  }
  const jsonFields = [
    "structuredData",
    "items",
    "vitals",
    "symptoms",
    "medications",
    "medicalFiles",
    "allergies",
    "immunizations",
  ];
  for (const field of jsonFields) {
    if (typeof normalized[field] === "string") {
      try {
        normalized[field] = JSON.parse(normalized[field] as string);
      } catch {
        delete normalized[field];
      }
    }
  }
  return normalized;
}

export class MedicalRecordController {
  async createRecord(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateMedicalRecordDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const attachments = await buildAttachments(req);
      const record = await medicalRecordService.createRecord(userId, {
        ...parsedData.data,
        attachments,
      });
      return res.status(201).json({
        success: true,
        data: record,
        message: "Medical record created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getRecordById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const recordId = req.params.id;
      const record = await medicalRecordService.getRecordById(
        userId,
        recordId,
      );
      return res.status(200).json({
        success: true,
        data: record,
        message: "Medical record fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllRecords(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await medicalRecordService.getAllRecords(userId, {
        page,
        limit,
      });
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: "Medical records fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateRecord(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateMedicalRecordDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const attachments = await buildAttachments(req);
      const recordId = req.params.id;
      const updatedRecord = await medicalRecordService.updateRecord(
        userId,
        recordId,
        {
          ...parsedData.data,
          ...(attachments.length ? { attachments } : {}),
        },
      );
      return res.status(200).json({
        success: true,
        data: updatedRecord,
        message: "Medical record updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteRecord(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const recordId = req.params.id;
      await medicalRecordService.deleteRecord(userId, recordId);
      return res
        .status(200)
        .json({ success: true, message: "Medical record deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
