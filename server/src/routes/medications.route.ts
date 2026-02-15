import { Router } from "express";
import { MedicationsController } from "../controller/medications.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const medicationsRouter = Router();
const medicationsController = new MedicationsController();

medicationsRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicationsController.createMedication,
);

medicationsRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicationsController.getAllMedications,
);

medicationsRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicationsController.getMedicationById,
);

medicationsRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicationsController.updateMedication,
);

medicationsRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicationsController.deleteMedication,
);

export default medicationsRouter;
