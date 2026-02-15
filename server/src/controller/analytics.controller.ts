import { Request, Response } from "express";
import z from "zod";
import { AnalyticsQueryDto } from "../dtos/analytics.dto";
import { AnalyticsService } from "../services/analytics.service";

const analyticsService = new AnalyticsService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class AnalyticsController {
  async getSummary(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsed = AnalyticsQueryDto.safeParse(req.query ?? {});
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsed.error) });
      }

      const summary = await analyticsService.getSummary(
        userId,
        parsed.data.months,
      );

      return res.status(200).json({
        success: true,
        data: summary,
        message: "Analytics summary fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
