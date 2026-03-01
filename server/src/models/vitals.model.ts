import mongoose, { HydratedDocument } from "mongoose";
import { VitalsType } from "../types/vitals.types";

export type VitalsDb = Omit<VitalsType, "userId" | "recordId"> & {
  userId: mongoose.Types.ObjectId;
  recordId?: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const vitalsSchema = new mongoose.Schema<VitalsDb>(
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
    systolicBp: Number,
    diastolicBp: Number,
    glucoseLevel: Number,
    heartRate: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: String,
  },
  { timestamps: true },
);

export type VitalsDocument = HydratedDocument<VitalsDb>;

export const Vitals = mongoose.model<VitalsDb>("Vitals", vitalsSchema);
