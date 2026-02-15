import { Router } from "express";
import { MedicalRecordController } from "../controller/medical-record.controller";
import { middlewares } from "../middlewares/authorization.middleware";
import { uploadsDocs } from "../middlewares/upload.middleware";

const medicalRecordRouter = Router();
const medicalRecordController = new MedicalRecordController();

medicalRecordRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  uploadsDocs.array("attachments", 10),
  medicalRecordController.createRecord,
);

medicalRecordRouter.get(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicalRecordController.getAllRecords,
);

medicalRecordRouter.get(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicalRecordController.getRecordById,
);

medicalRecordRouter.patch(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  uploadsDocs.array("attachments", 10),
  medicalRecordController.updateRecord,
);

medicalRecordRouter.delete(
  "/:id",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  medicalRecordController.deleteRecord,
);

export default medicalRecordRouter;
