import { Request, Response } from "express";
import { AiScanService } from "../services/ai-scan.service";

const aiScanService = new AiScanService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class AiScanController {
  async scanImage(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      const recordType = typeof req.body?.recordType === "string"
        ? req.body.recordType
        : undefined;

      const result = await aiScanService.scanImage(file.buffer, recordType);
      return res.status(200).json({
        success: true,
        data: result,
        message: "Scan completed",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
