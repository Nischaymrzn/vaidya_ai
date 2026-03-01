import z from "zod";

export const SymptomStatusSchema = z.enum(["ongoing", "resolved", "unknown"]);

export const SymptomsSchema = z.object({
  userId: z.string(),
  recordId: z.string().optional(),
  symptomList: z.array(z.string()).optional(),
  severity: z.string().optional(),
  status: SymptomStatusSchema.optional(),
  durationDays: z.coerce.number().int().nonnegative().optional(),
  diagnosis: z.string().optional(),
  disease: z.string().optional(),
  notes: z.string().optional(),
  loggedAt: z.coerce.date().optional(),
});

export type SymptomsType = z.infer<typeof SymptomsSchema>;
