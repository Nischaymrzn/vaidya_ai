import {
  Notification,
  NotificationDb,
  NotificationDocument,
} from "../models/notification.model";
import { NotificationType } from "../types/notification.types";

export interface INotificationRepository {
  create(data: Partial<NotificationType>): Promise<NotificationDocument>;
  getForUser(id: string, userId: string): Promise<NotificationDb | null>;
  getAllForUser(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    },
  ): Promise<{
    data: NotificationDb[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>;
  markRead(id: string, userId: string): Promise<NotificationDb | null>;
  markAllRead(userId: string): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
  async create(data: Partial<NotificationType>): Promise<NotificationDocument> {
    return Notification.create(data);
  }

  async getForUser(
    id: string,
    userId: string,
  ): Promise<NotificationDb | null> {
    return Notification.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
    options?: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { userId };
    if (options?.unreadOnly) filter.read = false;

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return {
      data: items as NotificationDb[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  async markRead(
    id: string,
    userId: string,
  ): Promise<NotificationDb | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true, readAt: new Date() },
      { new: true },
    ).lean();
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
    return result.modifiedCount ?? 0;
  }
}
