import mongoose, { HydratedDocument } from "mongoose";
import { LabTestType } from "../types/lab-test.types";

export type LabTestDb = Omit<LabTestType, "userId"> & {
  userId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const labTestSchema = new mongoose.Schema<LabTestDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    testName: {
      type: String,
      required: true,
    },
    resultValue: String,
    normalRange: String,
    unit: String,
    testedDate: {
      type: Date,
      index: true,
    },
    reportFileId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    notes: String,
  },
  { timestamps: true },
);

export type LabTestDocument = HydratedDocument<LabTestDb>;

export const LabTest = mongoose.model<LabTestDb>("LabTest", labTestSchema);
