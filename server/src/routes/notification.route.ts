import { Router } from "express";
import { NotificationController } from "../controller/notification.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  notificationController.getNotifications,
);

notificationRouter.patch(
  "/:id/read",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  notificationController.markRead,
);

notificationRouter.patch(
  "/read-all",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  notificationController.markAllRead,
);

export default notificationRouter;
