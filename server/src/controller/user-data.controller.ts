import { Request, Response } from "express";
import z from "zod";
import { UpdateUserDataDto } from "../dtos/user-data.dto";
import { UserDataService } from "../services/user-data.service";

const userDataService = new UserDataService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

function normalizePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload };
  if (normalized.dob === "") {
    delete normalized.dob;
  }
  if (normalized.heightCm === "") {
    delete normalized.heightCm;
  }
  if (normalized.weightKg === "") {
    delete normalized.weightKg;
  }
  return normalized;
}

export class UserDataController {
  async getUserData(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const data = await userDataService.getUserData(userId);
      return res.status(200).json({
        success: true,
        userId,
        data,
        message: "User data fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUserData(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateUserDataDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const data = await userDataService.updateUserData(
        userId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data,
        message: "User data updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
