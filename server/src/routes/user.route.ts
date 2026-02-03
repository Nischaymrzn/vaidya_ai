import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";
let userController = new UserController();
const userRouter = Router();

userRouter.get("/:id", middlewares.isAuthenticated, userController.getUserById);
userRouter.put(
  "/:id",
  middlewares.isAuthenticated,
  uploads.single("image"),
  userController.updateOneUser,
);
userRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  userController.deleteOneUser,
);

export default userRouter;
