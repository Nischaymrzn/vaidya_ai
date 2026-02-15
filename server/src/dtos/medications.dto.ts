import z from "zod";
import { MedicationsSchema } from "../types/medications.types";

export const CreateMedicationsDto = MedicationsSchema.omit({
  userId: true,
}).extend({
  recordId: z.string().optional(),
});

export type CreateMedicationsDto = z.infer<typeof CreateMedicationsDto>;

export const UpdateMedicationsDto = CreateMedicationsDto.partial();
export type UpdateMedicationsDto = z.infer<typeof UpdateMedicationsDto>;

export type CreateMedicationsPayload = CreateMedicationsDto;
export type UpdateMedicationsPayload = UpdateMedicationsDto;
