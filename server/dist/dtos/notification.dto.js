"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNotificationDto = exports.CreateNotificationDto = void 0;
const notification_types_1 = require("../types/notification.types");
exports.CreateNotificationDto = notification_types_1.NotificationSchema.omit({
    userId: true,
    readAt: true,
});
exports.UpdateNotificationDto = notification_types_1.NotificationSchema.pick({
    read: true,
});
