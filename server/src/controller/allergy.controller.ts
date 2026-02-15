import { Request, Response } from "express";
import z from "zod";
import {
  CreateAllergyDto,
  UpdateAllergyDto,
} from "../dtos/allergy.dto";
import { AllergyService } from "../services/allergy.service";

const allergyService = new AllergyService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class AllergyController {
  async createAllergy(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateAllergyDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const allergy = await allergyService.createAllergy(
        userId,
        parsedData.data,
      );
      return res.status(201).json({
        success: true,
        data: allergy,
        message: "Allergy created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllergyById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const allergyId = req.params.id;
      const allergy = await allergyService.getAllergyById(userId, allergyId);
      return res.status(200).json({
        success: true,
        data: allergy,
        message: "Allergy fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllAllergies(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await allergyService.getAllAllergies(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Allergies fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateAllergy(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateAllergyDto.safeParse(req.body ?? {});
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const allergyId = req.params.id;
      const updated = await allergyService.updateAllergy(
        userId,
        allergyId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Allergy updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteAllergy(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const allergyId = req.params.id;
      await allergyService.deleteAllergy(userId, allergyId);
      return res
        .status(200)
        .json({ success: true, message: "Allergy deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
