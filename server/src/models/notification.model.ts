import mongoose, { HydratedDocument } from "mongoose";
import { NotificationType } from "../types/notification.types";

export type NotificationDb = Omit<NotificationType, "userId"> & {
  userId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const notificationSchema = new mongoose.Schema<NotificationDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export type NotificationDocument = HydratedDocument<NotificationDb>;

export const Notification = mongoose.model<NotificationDb>(
  "Notification",
  notificationSchema,
);
