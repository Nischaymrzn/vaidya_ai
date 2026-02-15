import mongoose, { HydratedDocument } from "mongoose";
import { MedicationsType } from "../types/medications.types";

export type MedicationsDb = Omit<MedicationsType, "userId"> & {
  userId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const medicationsSchema = new mongoose.Schema<MedicationsDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    dosage: String,
    frequency: String,
    durationDays: Number,
    startDate: {
      type: Date,
      index: true,
    },
    endDate: Date,
    purpose: String,
    diagnosis: String,
    disease: String,
    notes: String,
  },
  { timestamps: true },
);

export type MedicationsDocument = HydratedDocument<MedicationsDb>;

export const Medications = mongoose.model<MedicationsDb>(
  "Medications",
  medicationsSchema,
);
