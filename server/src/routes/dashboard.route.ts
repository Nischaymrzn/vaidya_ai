import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const dashboardRouter = Router();
const dashboardController = new DashboardController();

dashboardRouter.get(
  "/summary",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  dashboardController.getSummary,
);

export default dashboardRouter;
