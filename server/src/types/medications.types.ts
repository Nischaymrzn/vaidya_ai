import z from "zod";

export const MedicationsSchema = z.object({
  userId: z.string(),
  recordId: z.string().optional(),
  medicineName: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  durationDays: z.coerce.number().int().nonnegative().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  purpose: z.string().optional(),
  diagnosis: z.string().optional(),
  disease: z.string().optional(),
  notes: z.string().optional(),
});

export type MedicationsType = z.infer<typeof MedicationsSchema>;
