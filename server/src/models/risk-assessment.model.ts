import mongoose, { HydratedDocument } from "mongoose";
import { RiskAssessmentType } from "../types/risk-assessment.types";

export type RiskAssessmentDb = Omit<RiskAssessmentType, "userId"> & {
  userId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const riskAssessmentSchema = new mongoose.Schema<RiskAssessmentDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    predictedCondition: String,
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      index: true,
    },
    confidenceScore: Number,
    riskScore: Number,
    vaidyaScore: Number,
    assessmentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

export type RiskAssessmentDocument = HydratedDocument<RiskAssessmentDb>;

export const RiskAssessment = mongoose.model<RiskAssessmentDb>(
  "RiskAssessment",
  riskAssessmentSchema,
);
