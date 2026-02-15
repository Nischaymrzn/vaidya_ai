import { Request, Response } from "express";
import z from "zod";
import {
  CreateMedicationsDto,
  UpdateMedicationsDto,
} from "../dtos/medications.dto";
import { MedicationsService } from "../services/medications.service";

const medicationsService = new MedicationsService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

function normalizePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload };
  if (normalized.startDate === "") {
    delete normalized.startDate;
  }
  if (normalized.endDate === "") {
    delete normalized.endDate;
  }
  if (normalized.recordId === "") {
    delete normalized.recordId;
  }
  return normalized;
}

export class MedicationsController {
  async createMedication(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateMedicationsDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const medication = await medicationsService.createMedication(
        userId,
        parsedData.data,
      );
      return res.status(201).json({
        success: true,
        data: medication,
        message: "Medication created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMedicationById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const medicationId = req.params.id;
      const medication = await medicationsService.getMedicationById(
        userId,
        medicationId,
      );
      return res.status(200).json({
        success: true,
        data: medication,
        message: "Medication fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllMedications(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await medicationsService.getAllMedications(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Medications fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateMedication(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateMedicationsDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const medicationId = req.params.id;
      const updated = await medicationsService.updateMedication(
        userId,
        medicationId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Medication updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteMedication(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const medicationId = req.params.id;
      await medicationsService.deleteMedication(userId, medicationId);
      return res
        .status(200)
        .json({ success: true, message: "Medication deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
