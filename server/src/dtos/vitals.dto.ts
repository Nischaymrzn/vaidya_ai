import z from "zod";
import { VitalsSchema } from "../types/vitals.types";

export const CreateVitalsDto = VitalsSchema.omit({ userId: true }).extend({
  recordId: z.string().optional(),
});

export type CreateVitalsDto = z.infer<typeof CreateVitalsDto>;

export const UpdateVitalsDto = CreateVitalsDto.partial();
export type UpdateVitalsDto = z.infer<typeof UpdateVitalsDto>;

export type CreateVitalsPayload = CreateVitalsDto;
export type UpdateVitalsPayload = UpdateVitalsDto;
