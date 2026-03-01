import mongoose, { HydratedDocument } from "mongoose";
import { SymptomsType } from "../types/symptoms.types";

export type SymptomsDb = Omit<SymptomsType, "userId" | "recordId"> & {
  userId: mongoose.Types.ObjectId;
  recordId?: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const symptomsSchema = new mongoose.Schema<SymptomsDb>(
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
    symptomList: {
      type: [String],
      default: [],
    },
    severity: String,
    status: {
      type: String,
      enum: ["ongoing", "resolved", "unknown"],
      default: "ongoing",
    },
    durationDays: Number,
    diagnosis: String,
    disease: String,
    notes: String,
    loggedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

export type SymptomsDocument = HydratedDocument<SymptomsDb>;

export const Symptoms = mongoose.model<SymptomsDb>("Symptoms", symptomsSchema);
