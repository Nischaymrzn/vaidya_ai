import z from "zod";

export const MedicalFileSchema = z.object({
  userId: z.string(),
  recordId: z.string().optional(),
  url: z.string().url(),
  publicId: z.string().optional(),
  type: z.string().optional(),
  name: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  uploadedAt: z.coerce.date().optional(),
});

export type MedicalFileType = z.infer<typeof MedicalFileSchema>;
