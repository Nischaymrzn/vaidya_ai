import { Request, Response } from "express";
import { AiInsightsService } from "../services/ai-insights.service";

const aiInsightsService = new AiInsightsService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class AiInsightsController {
  async generate(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const input =
        typeof req.body?.input === "string" ? req.body.input : "";
      const maxItems = Number(req.body?.maxItems ?? 3);
      const force = Boolean(req.body?.force);

      if (!input.trim()) {
        return res.status(400).json({
          success: false,
          message: "input is required",
        });
      }

      const insights = await aiInsightsService.generateInsights(
        userId,
        input,
        maxItems,
        force,
      );
      return res.status(200).json({
        success: true,
        data: insights,
        message: "Insights generated",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
