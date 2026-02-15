import { Router } from "express";
import { AiScanController } from "../controller/ai-scan.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

const aiScanRouter = Router();
const aiScanController = new AiScanController();

aiScanRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  uploads.single("file"),
  aiScanController.scanImage,
);

export default aiScanRouter;
