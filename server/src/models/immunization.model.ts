import mongoose, { HydratedDocument } from "mongoose";
import { ImmunizationType } from "../types/immunization.types";

export type ImmunizationDb = Omit<ImmunizationType, "userId"> & {
  userId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const immunizationSchema = new mongoose.Schema<ImmunizationDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vaccineName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      index: true,
    },
    doseNumber: Number,
    series: String,
    manufacturer: String,
    lotNumber: String,
    site: String,
    route: String,
    provider: String,
    nextDue: Date,
    notes: String,
  },
  { timestamps: true },
);

export type ImmunizationDocument = HydratedDocument<ImmunizationDb>;

export const Immunization = mongoose.model<ImmunizationDb>(
  "Immunization",
  immunizationSchema,
);
