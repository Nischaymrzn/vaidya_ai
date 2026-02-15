"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicalRecordDto = exports.CreateMedicalRecordDto = void 0;
const zod_1 = __importDefault(require("zod"));
const medical_record_types_1 = require("../types/medical-record.types");
const vitals_types_1 = require("../types/vitals.types");
const symptoms_types_1 = require("../types/symptoms.types");
const medications_types_1 = require("../types/medications.types");
const lab_test_types_1 = require("../types/lab-test.types");
const medical_file_types_1 = require("../types/medical-file.types");
const allergy_types_1 = require("../types/allergy.types");
const immunization_types_1 = require("../types/immunization.types");
const oneOrMany = (schema) => zod_1.default.union([schema, zod_1.default.array(schema)]);
exports.CreateMedicalRecordDto = medical_record_types_1.MedicalRecordSchema.omit({
    userId: true,
    attachments: true,
    deletedAt: true,
}).extend({
    vitals: oneOrMany(vitals_types_1.VitalsSchema.omit({ userId: true })).optional(),
    symptoms: oneOrMany(symptoms_types_1.SymptomsSchema.omit({ userId: true })).optional(),
    medications: oneOrMany(medications_types_1.MedicationsSchema.omit({ userId: true })).optional(),
    labTests: oneOrMany(lab_test_types_1.LabTestSchema.omit({ userId: true })).optional(),
    medicalFiles: oneOrMany(medical_file_types_1.MedicalFileSchema.omit({ userId: true })).optional(),
    allergies: oneOrMany(allergy_types_1.AllergySchema.omit({ userId: true })).optional(),
    immunizations: oneOrMany(immunization_types_1.ImmunizationSchema.omit({ userId: true })).optional(),
});
exports.UpdateMedicalRecordDto = exports.CreateMedicalRecordDto.partial();
