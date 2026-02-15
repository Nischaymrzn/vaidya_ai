import mongoose, { HydratedDocument } from "mongoose";

export type RiskSymptomsDb = {
  riskId: mongoose.Types.ObjectId;
  symptomsId: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
};

const riskSymptomsSchema = new mongoose.Schema<RiskSymptomsDb>(
  {
    riskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskAssessment",
      required: true,
      index: true,
    },
    symptomsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Symptoms",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export type RiskSymptomsDocument = HydratedDocument<RiskSymptomsDb>;

export const RiskSymptoms = mongoose.model<RiskSymptomsDb>(
  "RiskSymptoms",
  riskSymptomsSchema,
);
