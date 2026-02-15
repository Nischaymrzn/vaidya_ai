import z from "zod";
import { LabTestSchema } from "../types/lab-test.types";

export const CreateLabTestDto = LabTestSchema.omit({ userId: true }).extend({
  recordId: z.string().optional(),
});

export type CreateLabTestDto = z.infer<typeof CreateLabTestDto>;

export const UpdateLabTestDto = CreateLabTestDto.partial();
export type UpdateLabTestDto = z.infer<typeof UpdateLabTestDto>;

export type CreateLabTestPayload = CreateLabTestDto;
export type UpdateLabTestPayload = UpdateLabTestDto;
