import { Router } from "express";
import { LabTestController } from "../controller/lab-test.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const labTestRouter = Router();
const labTestController = new LabTestController();

labTestRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  labTestController.createLabTest,
);

labTestRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  labTestController.getAllLabTests,
);

labTestRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  labTestController.getLabTestById,
);

labTestRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  labTestController.updateLabTest,
);

labTestRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  labTestController.deleteLabTest,
);

export default labTestRouter;
