import mongoose, { HydratedDocument } from "mongoose";
import { UserDataType } from "../types/user-data.types";

export type UserDataDb = Omit<UserDataType, "userId"> & {
  userId: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
};

const latestVitalsSchema = new mongoose.Schema(
  {
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vitals",
    },
    recordedAt: Date,
    systolicBp: Number,
    diastolicBp: Number,
    glucoseLevel: Number,
    heartRate: Number,
    weight: Number,
    height: Number,
    bmi: Number,
  },
  { _id: false },
);

const userDataSchema = new mongoose.Schema<UserDataDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    fullName: String,
    dob: Date,
    gender: String,
    heightCm: Number,
    weightKg: Number,
    bloodGroup: String,
    phone: String,
    address: String,
    emergencyContact: String,
    latestVitals: {
      type: latestVitalsSchema,
      default: undefined,
    },
    vitals: {
      type: latestVitalsSchema,
      default: undefined,
    },
  },
  { timestamps: true },
);

export type UserDataDocument = HydratedDocument<UserDataDb>;

export const UserData = mongoose.model<UserDataDb>("UserData", userDataSchema);
