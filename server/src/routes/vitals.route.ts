import { Router } from "express";
import { VitalsController } from "../controller/vitals.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const vitalsRouter = Router();
const vitalsController = new VitalsController();

vitalsRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  vitalsController.createVitals,
);

vitalsRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  vitalsController.getAllVitals,
);

vitalsRouter.get(
  "/summary",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  vitalsController.getSummary,
);

vitalsRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  vitalsController.getVitalsById,
);

vitalsRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  vitalsController.updateVitals,
);

vitalsRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  vitalsController.deleteVitals,
);

export default vitalsRouter;
