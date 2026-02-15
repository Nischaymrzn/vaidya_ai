import mongoose, { HydratedDocument } from "mongoose";
import { AllergyType } from "../types/allergy.types";

export type AllergyDb = Omit<AllergyType, "userId"> & {
  userId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const allergySchema = new mongoose.Schema<AllergyDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    allergen: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["food", "drug", "environmental", "other"],
    },
    reaction: String,
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
    onsetDate: Date,
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: String,
  },
  { timestamps: true },
);

export type AllergyDocument = HydratedDocument<AllergyDb>;

export const Allergy = mongoose.model<AllergyDb>("Allergy", allergySchema);
