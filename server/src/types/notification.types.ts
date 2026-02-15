import z from "zod";

export const NotificationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
  read: z.coerce.boolean().optional(),
  readAt: z.coerce.date().optional(),
});

export type NotificationType = z.infer<typeof NotificationSchema>;
