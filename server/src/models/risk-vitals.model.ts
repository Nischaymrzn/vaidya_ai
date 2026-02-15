import mongoose, { HydratedDocument } from "mongoose";

export type RiskVitalsDb = {
  riskId: mongoose.Types.ObjectId;
  vitalsId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const riskVitalsSchema = new mongoose.Schema<RiskVitalsDb>(
  {
    riskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskAssessment",
      required: true,
      index: true,
    },
    vitalsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vitals",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export type RiskVitalsDocument = HydratedDocument<RiskVitalsDb>;

export const RiskVitals = mongoose.model<RiskVitalsDb>(
  "RiskVitals",
  riskVitalsSchema,
);
