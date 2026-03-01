import z from "zod";

export const ImmunizationSchema = z.object({
  userId: z.string(),
  recordId: z.string().optional(),
  vaccineName: z.string().min(1),
  date: z.coerce.date().optional(),
  doseNumber: z.coerce.number().int().nonnegative().optional(),
  series: z.string().optional(),
  manufacturer: z.string().optional(),
  lotNumber: z.string().optional(),
  site: z.string().optional(),
  route: z.string().optional(),
  provider: z.string().optional(),
  nextDue: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type ImmunizationType = z.infer<typeof ImmunizationSchema>;
