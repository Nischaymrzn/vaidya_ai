import { Router } from "express";
import { RiskAssessmentController } from "../controller/risk-assessment.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const riskAssessmentRouter = Router();
const riskAssessmentController = new RiskAssessmentController();

riskAssessmentRouter.post(
  "/generate",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  riskAssessmentController.generate,
);

riskAssessmentRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  riskAssessmentController.getAssessments,
);

riskAssessmentRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  riskAssessmentController.getAssessmentById,
);

export default riskAssessmentRouter;
