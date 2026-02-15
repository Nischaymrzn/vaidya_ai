import z from "zod";

export const LabTestSchema = z.object({
  userId: z.string(),
  testName: z.string().min(1),
  resultValue: z.string().optional(),
  normalRange: z.string().optional(),
  unit: z.string().optional(),
  testedDate: z.coerce.date().optional(),
  reportFileId: z.string().optional(),
  notes: z.string().optional(),
});

export type LabTestType = z.infer<typeof LabTestSchema>;
