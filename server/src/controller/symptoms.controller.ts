import { Request, Response } from "express";
import z from "zod";
import {
  CreateSymptomsDto,
  UpdateSymptomsDto,
} from "../dtos/symptoms.dto";
import { SymptomsService } from "../services/symptoms.service";

const symptomsService = new SymptomsService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

function normalizePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload };
  if (normalized.loggedAt === "") {
    delete normalized.loggedAt;
  }
  if (normalized.recordId === "") {
    delete normalized.recordId;
  }
  if (typeof normalized.symptomList === "string") {
    try {
      const parsed = JSON.parse(normalized.symptomList);
      if (Array.isArray(parsed)) {
        normalized.symptomList = parsed;
      } else {
        normalized.symptomList = String(normalized.symptomList)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      normalized.symptomList = String(normalized.symptomList)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return normalized;
}

export class SymptomsController {
  async createSymptoms(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateSymptomsDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const symptoms = await symptomsService.createSymptoms(
        userId,
        parsedData.data,
      );
      return res.status(201).json({
        success: true,
        data: symptoms,
        message: "Symptoms created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getSymptomsById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const symptomsId = req.params.id;
      const symptoms = await symptomsService.getSymptomsById(
        userId,
        symptomsId,
      );
      return res.status(200).json({
        success: true,
        data: symptoms,
        message: "Symptoms fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllSymptoms(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await symptomsService.getAllSymptoms(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Symptoms fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateSymptoms(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateSymptomsDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const symptomsId = req.params.id;
      const updated = await symptomsService.updateSymptoms(
        userId,
        symptomsId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Symptoms updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteSymptoms(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const symptomsId = req.params.id;
      await symptomsService.deleteSymptoms(userId, symptomsId);
      return res
        .status(200)
        .json({ success: true, message: "Symptoms deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
