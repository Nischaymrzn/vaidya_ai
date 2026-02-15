import { Router } from "express";
import { SymptomsController } from "../controller/symptoms.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const symptomsRouter = Router();
const symptomsController = new SymptomsController();

symptomsRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  symptomsController.createSymptoms,
);

symptomsRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  symptomsController.getAllSymptoms,
);

symptomsRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  symptomsController.getSymptomsById,
);

symptomsRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  symptomsController.updateSymptoms,
);

symptomsRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  symptomsController.deleteSymptoms,
);

export default symptomsRouter;
