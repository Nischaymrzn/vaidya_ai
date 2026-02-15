import { Router } from "express";
import { AiInsightsController } from "../controller/ai-insights.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const aiInsightsRouter = Router();
const aiInsightsController = new AiInsightsController();

aiInsightsRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  aiInsightsController.generate,
);

export default aiInsightsRouter;
