import { Request, Response } from "express";
import z from "zod";
import {
  CreateImmunizationDto,
  UpdateImmunizationDto,
} from "../dtos/immunization.dto";
import { ImmunizationService } from "../services/immunization.service";

const immunizationService = new ImmunizationService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class ImmunizationController {
  async createImmunization(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateImmunizationDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const immunization = await immunizationService.createImmunization(
        userId,
        parsedData.data,
      );
      return res.status(201).json({
        success: true,
        data: immunization,
        message: "Immunization created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getImmunizationById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const immunizationId = req.params.id;
      const immunization = await immunizationService.getImmunizationById(
        userId,
        immunizationId,
      );
      return res.status(200).json({
        success: true,
        data: immunization,
        message: "Immunization fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllImmunizations(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await immunizationService.getAllImmunizations(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Immunizations fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateImmunization(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateImmunizationDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const immunizationId = req.params.id;
      const updated = await immunizationService.updateImmunization(
        userId,
        immunizationId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Immunization updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteImmunization(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const immunizationId = req.params.id;
      await immunizationService.deleteImmunization(userId, immunizationId);
      return res
        .status(200)
        .json({ success: true, message: "Immunization deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
