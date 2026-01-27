import { Router } from "express";
import authRouter from "./auth.routes";
import adminRouter from "./admin.routes";
import userRouter from "./user.route";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/admin", adminRouter);
mainRouter.use("/users", userRouter);

export default mainRouter;
