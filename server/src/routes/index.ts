import { Router } from "express";
import authRouter from "./auth.route";
import adminRouter from "./admin.route";
import userRouter from "./user.route";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/admin", adminRouter);
mainRouter.use("/users", userRouter);

export default mainRouter;
