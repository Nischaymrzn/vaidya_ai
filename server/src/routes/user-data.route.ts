import { Router } from "express";
import { UserDataController } from "../controller/user-data.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const userDataRouter = Router();
const userDataController = new UserDataController();

userDataRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  userDataController.getUserData,
);

userDataRouter.patch(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  userDataController.updateUserData,
);

export default userDataRouter;
