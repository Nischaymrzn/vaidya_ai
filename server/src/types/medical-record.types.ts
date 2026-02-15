import z from "zod";

export const MedicalRecordStatusSchema = z.enum([
  "Verified",
  "Processed",
  "Reviewed",
  "Active",
]);

export const MedicalRecordAttachmentSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  type: z.string().optional(),
  name: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
});

export const MedicalRecordItemSchema = z.object({
  type: z.enum([
    "vitals",
    "symptoms",
    "medications",
    "lab_tests",
    "medical_files",
    "allergies",
    "immunizations",
  ]),
  refId: z.string(),
});

export const MedicalRecordSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  recordType: z.string().optional(),
  category: z.string().optional(),
  provider: z.string().optional(),
  recordDate: z.coerce.date().optional(),
  visitType: z.string().optional(),
  diagnosis: z.string().optional(),
  content: z.string().optional(),
  notes: z.string().optional(),
  status: MedicalRecordStatusSchema.optional(),
  aiScanned: z.coerce.boolean().optional(),
  structuredData: z.record(z.string(), z.unknown()).optional(),
  attachments: z.array(MedicalRecordAttachmentSchema).optional(),
  items: z.array(MedicalRecordItemSchema).optional(),
  deletedAt: z.date().optional(),
});

export type MedicalRecordType = z.infer<typeof MedicalRecordSchema>;
export type MedicalRecordAttachment = z.infer<typeof MedicalRecordAttachmentSchema>;
export type MedicalRecordStatus = z.infer<typeof MedicalRecordStatusSchema>;
export type MedicalRecordItem = z.infer<typeof MedicalRecordItemSchema>;
