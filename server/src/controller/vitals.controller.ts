import { Request, Response } from "express";
import z from "zod";
import {
  CreateVitalsDto,
  UpdateVitalsDto,
} from "../dtos/vitals.dto";
import { VitalsService } from "../services/vitals.service";

const vitalsService = new VitalsService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

function normalizePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload };
  if (normalized.recordedAt === "") {
    delete normalized.recordedAt;
  }
  if (normalized.bmi === "") {
    delete normalized.bmi;
  }
  if (normalized.recordId === "") {
    delete normalized.recordId;
  }
  return normalized;
}

export class VitalsController {
  async getSummary(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const summary = await vitalsService.getSummary(userId);
      return res.status(200).json({
        success: true,
        data: summary,
        message: "Vitals summary fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async createVitals(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateVitalsDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const vitals = await vitalsService.createVitals(userId, parsedData.data);
      return res.status(201).json({
        success: true,
        data: vitals,
        message: "Vitals created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getVitalsById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const vitalsId = req.params.id;
      const vitals = await vitalsService.getVitalsById(userId, vitalsId);
      return res.status(200).json({
        success: true,
        data: vitals,
        message: "Vitals fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllVitals(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await vitalsService.getAllVitals(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Vitals fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateVitals(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateVitalsDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const vitalsId = req.params.id;
      const updated = await vitalsService.updateVitals(
        userId,
        vitalsId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Vitals updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteVitals(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const vitalsId = req.params.id;
      await vitalsService.deleteVitals(userId, vitalsId);
      return res
        .status(200)
        .json({ success: true, message: "Vitals deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
