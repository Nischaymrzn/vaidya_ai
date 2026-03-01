import z from "zod";

const VitalsSnapshotSchema = z.object({
  refId: z.string().optional(),
  recordedAt: z.coerce.date().optional(),
  systolicBp: z.coerce.number().int().nonnegative().optional(),
  diastolicBp: z.coerce.number().int().nonnegative().optional(),
  glucoseLevel: z.coerce.number().nonnegative().optional(),
  heartRate: z.coerce.number().int().nonnegative().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  height: z.coerce.number().nonnegative().optional(),
  bmi: z.coerce.number().nonnegative().optional(),
});

export const UserDataSchema = z.object({
  userId: z.string(),
  fullName: z.string().optional(),
  dob: z.coerce.date().optional(),
  gender: z.string().optional(),
  heightCm: z.coerce.number().int().nonnegative().optional(),
  weightKg: z.coerce.number().nonnegative().optional(),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  latestVitals: VitalsSnapshotSchema.optional(),
  vitals: VitalsSnapshotSchema.optional(),
});

export type UserDataType = z.infer<typeof UserDataSchema>;
