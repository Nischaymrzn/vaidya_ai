"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordSchema = exports.MedicalRecordItemSchema = exports.MedicalRecordAttachmentSchema = exports.MedicalRecordStatusSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.MedicalRecordStatusSchema = zod_1.default.enum([
    "Verified",
    "Processed",
    "Reviewed",
    "Active",
]);
exports.MedicalRecordAttachmentSchema = zod_1.default.object({
    url: zod_1.default.string().url(),
    publicId: zod_1.default.string().optional(),
    type: zod_1.default.string().optional(),
    name: zod_1.default.string().optional(),
    size: zod_1.default.number().int().nonnegative().optional(),
});
exports.MedicalRecordItemSchema = zod_1.default.object({
    type: zod_1.default.enum([
        "vitals",
        "symptoms",
        "medications",
        "lab_tests",
        "medical_files",
        "allergies",
        "immunizations",
    ]),
    refId: zod_1.default.string(),
});
exports.MedicalRecordSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    title: zod_1.default.string().min(1),
    recordType: zod_1.default.string().optional(),
    category: zod_1.default.string().optional(),
    provider: zod_1.default.string().optional(),
    recordDate: zod_1.default.coerce.date().optional(),
    visitType: zod_1.default.string().optional(),
    diagnosis: zod_1.default.string().optional(),
    content: zod_1.default.string().optional(),
    notes: zod_1.default.string().optional(),
    status: exports.MedicalRecordStatusSchema.optional(),
    aiScanned: zod_1.default.coerce.boolean().optional(),
    structuredData: zod_1.default.record(zod_1.default.string(), zod_1.default.unknown()).optional(),
    attachments: zod_1.default.array(exports.MedicalRecordAttachmentSchema).optional(),
    items: zod_1.default.array(exports.MedicalRecordItemSchema).optional(),
    deletedAt: zod_1.default.date().optional(),
});
