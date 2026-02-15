import { Request, Response } from "express";
import { HealthInsightService } from "../services/health-insight.service";

const healthInsightService = new HealthInsightService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class HealthInsightController {
  async getInsights(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const riskId =
        typeof req.query?.riskId === "string" ? req.query.riskId : undefined;
      const insights = await healthInsightService.getInsights(userId, riskId);
      return res.status(200).json({
        success: true,
        data: insights,
        message: "Insights fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getInsightById(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const insightId = req.params.id;
      const insight = await healthInsightService.getInsightById(
        userId,
        insightId,
      );
      return res.status(200).json({
        success: true,
        data: insight,
        message: "Insight fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
