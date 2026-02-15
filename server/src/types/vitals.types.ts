import z from "zod";

export const VitalsSchema = z.object({
  userId: z.string(),
  systolicBp: z.coerce.number().int().nonnegative().optional(),
  diastolicBp: z.coerce.number().int().nonnegative().optional(),
  glucoseLevel: z.coerce.number().nonnegative().optional(),
  heartRate: z.coerce.number().int().nonnegative().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  height: z.coerce.number().nonnegative().optional(),
  bmi: z.coerce.number().nonnegative().optional(),
  recordedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type VitalsType = z.infer<typeof VitalsSchema>;
