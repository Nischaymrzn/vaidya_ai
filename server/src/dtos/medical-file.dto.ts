import z from "zod";
import { MedicalFileSchema } from "../types/medical-file.types";

export const CreateMedicalFileDto = MedicalFileSchema.omit({
  userId: true,
  url: true,
  publicId: true,
  type: true,
  name: true,
  size: true,
  uploadedAt: true,
}).extend({
  recordId: z.string().optional(),
  url: z.string().url().optional(),
});

export type CreateMedicalFileDto = z.infer<typeof CreateMedicalFileDto>;

export const UpdateMedicalFileDto = CreateMedicalFileDto.partial();
export type UpdateMedicalFileDto = z.infer<typeof UpdateMedicalFileDto>;

export type CreateMedicalFilePayload = CreateMedicalFileDto;
export type UpdateMedicalFilePayload = UpdateMedicalFileDto;
