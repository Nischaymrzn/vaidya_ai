import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const unreadOnly =
        req.query.unreadOnly === "true" || req.query.unreadOnly === "1";

      const result = await notificationService.getAllNotifications(userId, {
        page,
        limit,
        unreadOnly,
      });
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: "Notifications fetched",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const notificationId = req.params.id;
      const updated = await notificationService.markRead(
        userId,
        notificationId,
      );
      return res.status(200).json({
        success: true,
        data: updated,
        message: "Notification marked as read",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await notificationService.markAllRead(userId);
      return res.status(200).json({
        success: true,
        data: result,
        message: "All notifications marked as read",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
