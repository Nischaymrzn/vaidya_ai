import { Router } from "express";
import { DiseasePredictionController } from "../controller/disease-prediction.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

const predictionController = new DiseasePredictionController();
const predictionRouter = Router();

predictionRouter.post(
  "/symptom",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  predictionController.predict,
);

predictionRouter.post(
  "/heart-disease",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  predictionController.predictHeartDisease,
);

predictionRouter.post(
  "/diabetes",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  predictionController.predictDiabetes,
);

predictionRouter.post(
  "/brain-tumor",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  uploads.single("file"),
  predictionController.predictBrainTumor,
);

predictionRouter.post(
  "/tuberculosis",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  uploads.single("file"),
  predictionController.predictTuberculosis,
);

export default predictionRouter;
