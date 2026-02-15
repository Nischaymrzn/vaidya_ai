import z from "zod";
import { NotificationSchema } from "../types/notification.types";

export const CreateNotificationDto = NotificationSchema.omit({
  userId: true,
  readAt: true,
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationDto>;

export const UpdateNotificationDto = NotificationSchema.pick({
  read: true,
});

export type UpdateNotificationDto = z.infer<typeof UpdateNotificationDto>;
