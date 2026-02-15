import z from "zod";

export const SymptomsSchema = z.object({
  userId: z.string(),
  symptomList: z.array(z.string()).optional(),
  severity: z.string().optional(),
  durationDays: z.coerce.number().int().nonnegative().optional(),
  diagnosis: z.string().optional(),
  disease: z.string().optional(),
  notes: z.string().optional(),
  loggedAt: z.coerce.date().optional(),
});

export type SymptomsType = z.infer<typeof SymptomsSchema>;
