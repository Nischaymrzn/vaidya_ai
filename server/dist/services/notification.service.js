"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const notification_repository_1 = require("../repositories/notification.repository");
const notificationRepository = new notification_repository_1.NotificationRepository();
class NotificationService {
    async createNotification(userId, data) {
        return notificationRepository.create({ ...data, userId });
    }
    async getAllNotifications(userId, options) {
        return notificationRepository.getAllForUser(userId, options);
    }
    async markRead(userId, notificationId) {
        const updated = await notificationRepository.markRead(notificationId, userId);
        if (!updated)
            throw new apiError_1.default(404, "Notification not found");
        return updated;
    }
    async markAllRead(userId) {
        const count = await notificationRepository.markAllRead(userId);
        return { count };
    }
}
exports.NotificationService = NotificationService;
