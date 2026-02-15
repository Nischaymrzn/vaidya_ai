import mongoose, { HydratedDocument } from "mongoose";
import { MedicalRecordType } from "../types/medical-record.types";

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    type: {
      type: String,
    },
    name: {
      type: String,
    },
    size: {
      type: Number,
    },
  },
  { _id: false },
);

const recordItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "vitals",
        "symptoms",
        "medications",
        "lab_tests",
        "medical_files",
        "allergies",
        "immunizations",
      ],
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { _id: false },
);

export type MedicalRecordDb = Omit<MedicalRecordType, "userId"> & {
  userId: mongoose.Types.ObjectId;
};

const medicalRecordSchema = new mongoose.Schema<MedicalRecordDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    recordType: {
      type: String,
    },
    category: {
      type: String,
    },
    provider: {
      type: String,
    },
    recordDate: {
      type: Date,
    },
    visitType: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    content: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Verified", "Processed", "Reviewed", "Active"],
      default: "Processed",
    },
    aiScanned: {
      type: Boolean,
      default: false,
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    items: {
      type: [recordItemSchema],
      default: [],
    },
    deletedAt: Date,
  },
  { timestamps: true },
);

export type MedicalRecordDocument = HydratedDocument<MedicalRecordDb>;

export const MedicalRecord = mongoose.model<MedicalRecordDb>(
  "MedicalRecord",
  medicalRecordSchema,
);
