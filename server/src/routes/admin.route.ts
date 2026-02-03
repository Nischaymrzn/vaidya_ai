import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

let adminUserController = new UserController();
const adminRouter = Router();

adminRouter.get(
  "/users",
  middlewares.isAuthenticated,
  middlewares.adminOnlyMiddleware,
  adminUserController.getAllUsers,
);
adminRouter.get(
  "/users/:id",
  middlewares.isAuthenticated,
  middlewares.adminOnlyMiddleware,
  adminUserController.getUserById,
);
adminRouter.patch(
  "/users/:id",
  middlewares.isAuthenticated,
  middlewares.adminOnlyMiddleware,
  uploads.single("profilePicture"),
  adminUserController.updateOneUser,
);
adminRouter.delete(
  "/users/:id",
  middlewares.isAuthenticated,
  middlewares.adminOnlyMiddleware,
  adminUserController.deleteOneUser,
);
adminRouter.post(
  "/users",
  middlewares.isAuthenticated,
  middlewares.adminOnlyMiddleware,
  uploads.single("profilePicture"),
  adminUserController.createUser,
);

export default adminRouter;
