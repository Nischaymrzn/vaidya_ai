import z from "zod";

const RiskAssessmentFindingSchema = z.object({
  title: z.string(),
  detail: z.string(),
  priority: z.enum(["High", "Medium", "Low", "Info"]).optional(),
});

const RiskAssessmentDemographicsSchema = z.object({
  name: z.string().optional(),
  age: z.coerce.number().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  heightCm: z.coerce.number().optional(),
  weightKg: z.coerce.number().optional(),
});

const RiskAssessmentVitalsSnapshotSchema = z.object({
  recordedAt: z.coerce.date().optional(),
  systolicBp: z.coerce.number().optional(),
  diastolicBp: z.coerce.number().optional(),
  glucoseLevel: z.coerce.number().optional(),
  heartRate: z.coerce.number().optional(),
  bmi: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
});

const RiskAssessmentAnalysisSchema = z.object({
  summary: z.string().optional(),
  demographics: RiskAssessmentDemographicsSchema.optional(),
  vitalsSnapshot: RiskAssessmentVitalsSnapshotSchema.optional(),
  sections: z
    .object({
      vitals: z.string().optional(),
      symptoms: z.string().optional(),
      records: z.string().optional(),
      medications: z.string().optional(),
      allergies: z.string().optional(),
      immunizations: z.string().optional(),
    })
    .optional(),
  keyFindings: z.array(RiskAssessmentFindingSchema).optional(),
  dataGaps: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  generatedAt: z.coerce.date().optional(),
});

export const RiskAssessmentSchema = z.object({
  userId: z.string(),
  predictedCondition: z.string().optional(),
  riskLevel: z.enum(["Low", "Medium", "High"]).optional(),
  confidenceScore: z.coerce.number().min(0).max(1).optional(),
  riskScore: z.coerce.number().min(0).max(100).optional(),
  vaidyaScore: z.coerce.number().min(0).max(100).optional(),
  assessmentDate: z.coerce.date().optional(),
  analysis: RiskAssessmentAnalysisSchema.optional(),
});

export type RiskAssessmentType = z.infer<typeof RiskAssessmentSchema>;
