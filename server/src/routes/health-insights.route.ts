import { Router } from "express";
import { HealthInsightController } from "../controller/health-insight.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const healthInsightRouter = Router();
const healthInsightController = new HealthInsightController();

healthInsightRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  healthInsightController.getInsights,
);

healthInsightRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  healthInsightController.getInsightById,
);

export default healthInsightRouter;
