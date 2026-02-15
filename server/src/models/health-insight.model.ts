import mongoose, { HydratedDocument } from "mongoose";
import { HealthInsightType } from "../types/health-insight.types";

export type HealthInsightDb = Omit<HealthInsightType, "userId" | "generatedFromRisk"> & {
  userId: mongoose.Types.ObjectId;
  generatedFromRisk?: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const healthInsightSchema = new mongoose.Schema<HealthInsightDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    insightTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    generatedFromRisk: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskAssessment",
      index: true,
    },
    contextType: {
      type: String,
      index: true,
    },
    contextHash: {
      type: String,
      index: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low", "Info"],
      default: "Info",
      index: true,
    },
  },
  { timestamps: true },
);

export type HealthInsightDocument = HydratedDocument<HealthInsightDb>;

export const HealthInsight = mongoose.model<HealthInsightDb>(
  "HealthInsight",
  healthInsightSchema,
);
