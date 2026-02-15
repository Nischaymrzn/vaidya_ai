import { Request, Response } from "express";
import z from "zod";
import { CreateLabTestDto, UpdateLabTestDto } from "../dtos/lab-test.dto";
import { LabTestService } from "../services/lab-test.service";

const labTestService = new LabTestService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

function normalizePayload(payload: Record<string, unknown>) {
  const normalized = { ...payload };
  if (normalized.testedDate === "") {
    delete normalized.testedDate;
  }
  if (normalized.recordId === "") {
    delete normalized.recordId;
  }
  return normalized;
}

export class LabTestController {
  async createLabTest(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = CreateLabTestDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const labTest = await labTestService.createLabTest(userId, parsedData.data);
      return res.status(201).json({
        success: true,
        data: labTest,
        message: "Lab test created",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getLabTestById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const labTestId = req.params.id;
      const labTest = await labTestService.getLabTestById(userId, labTestId);
      return res.status(200).json({
        success: true,
        data: labTest,
        message: "Lab test fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllLabTests(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await labTestService.getAllLabTests(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Lab tests fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateLabTest(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsedData = UpdateLabTestDto.safeParse(
        normalizePayload(req.body ?? {}),
      );
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const labTestId = req.params.id;
      const updated = await labTestService.updateLabTest(
        userId,
        labTestId,
        parsedData.data,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Lab test updated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteLabTest(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const labTestId = req.params.id;
      await labTestService.deleteLabTest(userId, labTestId);
      return res
        .status(200)
        .json({ success: true, message: "Lab test deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
