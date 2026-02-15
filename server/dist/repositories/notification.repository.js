"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const notification_model_1 = require("../models/notification.model");
class NotificationRepository {
    async create(data) {
        return notification_model_1.Notification.create(data);
    }
    async getForUser(id, userId) {
        return notification_model_1.Notification.findOne({ _id: id, userId }).lean();
    }
    async getAllForUser(userId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
        const skip = (page - 1) * limit;
        const filter = { userId };
        if (options?.unreadOnly)
            filter.read = false;
        const [items, total] = await Promise.all([
            notification_model_1.Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            notification_model_1.Notification.countDocuments(filter),
        ]);
        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async markRead(id, userId) {
        return notification_model_1.Notification.findOneAndUpdate({ _id: id, userId }, { read: true, readAt: new Date() }, { new: true }).lean();
    }
    async markAllRead(userId) {
        const result = await notification_model_1.Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() });
        return result.modifiedCount ?? 0;
    }
}
exports.NotificationRepository = NotificationRepository;
