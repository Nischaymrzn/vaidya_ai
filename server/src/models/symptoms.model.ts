import mongoose, { HydratedDocument } from "mongoose";
import { SymptomsType } from "../types/symptoms.types";

export type SymptomsDb = Omit<SymptomsType, "userId"> & {
  userId: mongoose.Types.ObjectId;
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
    symptomList: {
      type: [String],
      default: [],
    },
    severity: String,
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
