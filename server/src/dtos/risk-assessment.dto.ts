import z from "zod";

export const GenerateRiskAssessmentDto = z.object({
  vitalsIds: z.array(z.string()).optional(),
  symptomsIds: z.array(z.string()).optional(),
  maxInsights: z.coerce.number().int().min(1).max(8).optional(),
  notes: z.string().optional(),
  useLatest: z.coerce.boolean().optional(),
  includeAi: z.coerce.boolean().optional(),
  reportId: z.string().optional(),
  force: z.coerce.boolean().optional(),
});

export type GenerateRiskAssessmentDto = z.infer<
  typeof GenerateRiskAssessmentDto
>;

export type GenerateRiskAssessmentPayload = GenerateRiskAssessmentDto;
