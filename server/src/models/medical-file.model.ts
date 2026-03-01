import mongoose, { HydratedDocument } from "mongoose";
import { MedicalFileType } from "../types/medical-file.types";

export type MedicalFileDb = Omit<MedicalFileType, "userId" | "recordId"> & {
  userId: mongoose.Types.ObjectId;
  recordId?: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const medicalFileSchema = new mongoose.Schema<MedicalFileDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: String,
    type: String,
    name: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

export type MedicalFileDocument = HydratedDocument<MedicalFileDb>;

export const MedicalFile = mongoose.model<MedicalFileDb>(
  "MedicalFile",
  medicalFileSchema,
);
