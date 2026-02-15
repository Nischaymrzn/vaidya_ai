import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

const dashboardService = new DashboardService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const userName = String((req.user as { name?: string } | undefined)?.name ?? "");
      const summary = await dashboardService.getSummary(userId, userName);

      return res.status(200).json({
        success: true,
        data: summary,
        message: "Dashboard summary fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
