import z from "zod";
import { AllergySchema } from "../types/allergy.types";

export const CreateAllergyDto = AllergySchema.omit({ userId: true });

export type CreateAllergyDto = z.infer<typeof CreateAllergyDto>;

export const UpdateAllergyDto = CreateAllergyDto.partial();
export type UpdateAllergyDto = z.infer<typeof UpdateAllergyDto>;

export type CreateAllergyPayload = CreateAllergyDto;
export type UpdateAllergyPayload = UpdateAllergyDto;
