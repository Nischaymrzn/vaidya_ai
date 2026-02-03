import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const authRouter = Router();

const authcontroller = new AuthController();

authRouter.post("/login", authcontroller.loginUser);
authRouter.post("/register", authcontroller.createUser);
authRouter.get(
  "/me",
  middlewares.isAuthenticated,
  authcontroller.getCurrentUser,
);

export default authRouter;
