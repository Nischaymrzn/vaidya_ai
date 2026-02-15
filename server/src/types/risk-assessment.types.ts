import z from "zod";

export const RiskAssessmentSchema = z.object({
  userId: z.string(),
  predictedCondition: z.string().optional(),
  riskLevel: z.enum(["Low", "Medium", "High"]).optional(),
  confidenceScore: z.coerce.number().min(0).max(1).optional(),
  riskScore: z.coerce.number().min(0).max(100).optional(),
  vaidyaScore: z.coerce.number().min(0).max(100).optional(),
  assessmentDate: z.coerce.date().optional(),
});

export type RiskAssessmentType = z.infer<typeof RiskAssessmentSchema>;
