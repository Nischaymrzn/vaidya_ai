import { Router } from "express";
import { MedicalFileController } from "../controller/medical-file.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { uploadsDocs } from "../middlewares/upload.middleware";

const medicalFileRouter = Router();
const medicalFileController = new MedicalFileController();

medicalFileRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  uploadsDocs.single("file"),
  medicalFileController.createMedicalFile,
);

medicalFileRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicalFileController.getAllMedicalFiles,
);

medicalFileRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicalFileController.getMedicalFileById,
);

medicalFileRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicalFileController.updateMedicalFile,
);

medicalFileRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicalFileController.deleteMedicalFile,
);

export default medicalFileRouter;
