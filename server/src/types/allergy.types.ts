import z from "zod";

export const AllergySchema = z.object({
  userId: z.string(),
  allergen: z.string().min(1),
  type: z
    .enum(["food", "drug", "environmental", "other"])
    .optional(),
  reaction: z.string().optional(),
  severity: z.enum(["mild", "moderate", "severe"]).optional(),
  status: z.enum(["active", "resolved"]).optional(),
  onsetDate: z.coerce.date().optional(),
  recordedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type AllergyType = z.infer<typeof AllergySchema>;
