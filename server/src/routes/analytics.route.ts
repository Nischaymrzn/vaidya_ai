import { Router } from "express";
import { AnalyticsController } from "../controller/analytics.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const analyticsRouter = Router();
const analyticsController = new AnalyticsController();

analyticsRouter.get(
  "/summary",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  analyticsController.getSummary,
);

export default analyticsRouter;
