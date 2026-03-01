import z from "zod";
import { ImmunizationSchema } from "../types/immunization.types";

export const CreateImmunizationDto = ImmunizationSchema.omit({
  userId: true,
});

export type CreateImmunizationDto = z.infer<typeof CreateImmunizationDto>;

export const UpdateImmunizationDto = CreateImmunizationDto.partial();
export type UpdateImmunizationDto = z.infer<typeof UpdateImmunizationDto>;

export type CreateImmunizationPayload = CreateImmunizationDto;
export type UpdateImmunizationPayload = UpdateImmunizationDto;
