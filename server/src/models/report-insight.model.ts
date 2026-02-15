import mongoose, { HydratedDocument } from "mongoose";

export type ReportInsightDb = {
  reportId: mongoose.Types.ObjectId;
  insightId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const reportInsightSchema = new mongoose.Schema<ReportInsightDb>(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    insightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthInsight",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export type ReportInsightDocument = HydratedDocument<ReportInsightDb>;

export const ReportInsight = mongoose.model<ReportInsightDb>(
  "ReportInsight",
  reportInsightSchema,
);
