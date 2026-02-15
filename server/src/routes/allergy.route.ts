import { Router } from "express";
import { AllergyController } from "../controller/allergy.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const allergyRouter = Router();
const allergyController = new AllergyController();

allergyRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  allergyController.createAllergy,
);

allergyRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  allergyController.getAllAllergies,
);

allergyRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  allergyController.getAllergyById,
);

allergyRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  allergyController.updateAllergy,
);

allergyRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  allergyController.deleteAllergy,
);

export default allergyRouter;
