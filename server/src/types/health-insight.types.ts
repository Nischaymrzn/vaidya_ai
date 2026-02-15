import z from "zod";

export const HealthInsightSchema = z.object({
  userId: z.string(),
  insightTitle: z.string().min(1),
  description: z.string().min(1),
  generatedFromRisk: z.string().optional(),
  contextType: z.string().optional(),
  contextHash: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low", "Info"]).optional(),
  createdAt: z.coerce.date().optional(),
});

export type HealthInsightType = z.infer<typeof HealthInsightSchema>;
