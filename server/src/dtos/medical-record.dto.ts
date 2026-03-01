import z from "zod";
import {
  MedicalRecordAttachment,
  MedicalRecordSchema,
} from "../types/medical-record.types";
import { VitalsSchema } from "../types/vitals.types";
import { SymptomsSchema } from "../types/symptoms.types";
import { MedicationsSchema } from "../types/medications.types";
import { MedicalFileSchema } from "../types/medical-file.types";
import { AllergySchema } from "../types/allergy.types";
import { ImmunizationSchema } from "../types/immunization.types";

const oneOrMany = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)]);

export const CreateMedicalRecordDto = MedicalRecordSchema.omit({
  userId: true,
  attachments: true,
  deletedAt: true,
}).extend({
  vitals: oneOrMany(VitalsSchema.omit({ userId: true })).optional(),
  symptoms: oneOrMany(SymptomsSchema.omit({ userId: true })).optional(),
  medications: oneOrMany(MedicationsSchema.omit({ userId: true })).optional(),
  medicalFiles: oneOrMany(MedicalFileSchema.omit({ userId: true })).optional(),
  allergies: oneOrMany(AllergySchema.omit({ userId: true })).optional(),
  immunizations: oneOrMany(ImmunizationSchema.omit({ userId: true })).optional(),
});

export type CreateMedicalRecordDto = z.infer<typeof CreateMedicalRecordDto>;

export const UpdateMedicalRecordDto = CreateMedicalRecordDto.partial();
export type UpdateMedicalRecordDto = z.infer<typeof UpdateMedicalRecordDto>;

export type CreateMedicalRecordPayload = CreateMedicalRecordDto & {
  attachments?: MedicalRecordAttachment[];
};

export type UpdateMedicalRecordPayload = UpdateMedicalRecordDto & {
  attachments?: MedicalRecordAttachment[];
};
