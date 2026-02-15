import { Router } from "express";
import { ImmunizationController } from "../controller/immunization.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const immunizationRouter = Router();
const immunizationController = new ImmunizationController();

immunizationRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  immunizationController.createImmunization,
);

immunizationRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  immunizationController.getAllImmunizations,
);

immunizationRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  immunizationController.getImmunizationById,
);

immunizationRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  immunizationController.updateImmunization,
);

immunizationRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  immunizationController.deleteImmunization,
);

export default immunizationRouter;
