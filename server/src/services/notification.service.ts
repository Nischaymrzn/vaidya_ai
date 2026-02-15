import ApiError from "../exceptions/apiError";
import {
  NotificationRepository,
} from "../repositories/notification.repository";
import { CreateNotificationDto } from "../dtos/notification.dto";

const notificationRepository = new NotificationRepository();

export class NotificationService {
  async createNotification(userId: string, data: CreateNotificationDto) {
    return notificationRepository.create({ ...data, userId });
  }

  async getAllNotifications(
    userId: string,
    options?: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    return notificationRepository.getAllForUser(userId, options);
  }

  async markRead(userId: string, notificationId: string) {
    const updated = await notificationRepository.markRead(
      notificationId,
      userId,
    );
    if (!updated) throw new ApiError(404, "Notification not found");
    return updated;
  }

  async markAllRead(userId: string) {
    const count = await notificationRepository.markAllRead(userId);
    return { count };
  }
}
