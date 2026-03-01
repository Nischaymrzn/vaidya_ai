import z from "zod";
import { SymptomsSchema } from "../types/symptoms.types";

export const CreateSymptomsDto = SymptomsSchema.omit({ userId: true });

export type CreateSymptomsDto = z.infer<typeof CreateSymptomsDto>;

export const UpdateSymptomsDto = CreateSymptomsDto.partial();
export type UpdateSymptomsDto = z.infer<typeof UpdateSymptomsDto>;

export type CreateSymptomsPayload = CreateSymptomsDto;
export type UpdateSymptomsPayload = UpdateSymptomsDto;
