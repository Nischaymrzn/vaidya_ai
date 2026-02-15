"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecordService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const medical_record_repository_1 = require("../repositories/medical-record.repository");
const vitals_service_1 = require("./vitals.service");
const symptoms_service_1 = require("./symptoms.service");
const medications_service_1 = require("./medications.service");
const lab_test_service_1 = require("./lab-test.service");
const medical_file_service_1 = require("./medical-file.service");
const allergy_service_1 = require("./allergy.service");
const immunization_service_1 = require("./immunization.service");
const notification_service_1 = require("./notification.service");
const medicalRecordRepository = new medical_record_repository_1.MedicalRecordRepository();
const vitalsService = new vitals_service_1.VitalsService();
const symptomsService = new symptoms_service_1.SymptomsService();
const medicationsService = new medications_service_1.MedicationsService();
const labTestService = new lab_test_service_1.LabTestService();
const medicalFileService = new medical_file_service_1.MedicalFileService();
const allergyService = new allergy_service_1.AllergyService();
const immunizationService = new immunization_service_1.ImmunizationService();
const notificationService = new notification_service_1.NotificationService();
const asArray = (value) => value ? (Array.isArray(value) ? value : [value]) : [];
const isEmptyObject = (value) => !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0;
class MedicalRecordService {
    async createRecord(userId, data) {
        const { vitals, symptoms, medications, labTests, medicalFiles, allergies, immunizations, attachments, ...recordData } = data;
        const record = await medicalRecordRepository.createRecord({
            ...recordData,
            userId,
            attachments,
        });
        if (!record)
            throw new apiError_1.default(500, "Failed to create medical record");
        try {
            const recordLabel = record.recordType || record.category || "Medical record";
            await notificationService.createNotification(userId, {
                type: "record_created",
                title: "Record added",
                message: `${recordLabel} created successfully.`,
                data: { recordId: String(record._id), recordType: record.recordType },
            });
            if (record.aiScanned) {
                await notificationService.createNotification(userId, {
                    type: "ai_review",
                    title: "AI summary ready",
                    message: `Review AI insights for ${recordLabel}.`,
                    data: { recordId: String(record._id), recordType: record.recordType },
                });
            }
        }
        catch {
            // Best-effort notification; do not block record creation.
        }
        const recordId = String(record._id);
        const vitalsList = asArray(vitals).filter((item) => !isEmptyObject(item));
        const symptomsList = asArray(symptoms).filter((item) => !isEmptyObject(item));
        const medicationsList = asArray(medications).filter((item) => !isEmptyObject(item));
        const labTestsList = asArray(labTests).filter((item) => !isEmptyObject(item));
        const medicalFilesList = asArray(medicalFiles).filter((item) => !isEmptyObject(item));
        const allergiesList = asArray(allergies).filter((item) => !isEmptyObject(item));
        const immunizationsList = asArray(immunizations).filter((item) => !isEmptyObject(item));
        const createdIds = {
            vitals: [],
            symptoms: [],
            medications: [],
            labTests: [],
            medicalFiles: [],
            allergies: [],
            immunizations: [],
        };
        try {
            for (const item of vitalsList) {
                const created = await vitalsService.createVitals(userId, {
                    ...item,
                    recordId,
                });
                createdIds.vitals.push(String(created._id));
            }
            for (const item of symptomsList) {
                const created = await symptomsService.createSymptoms(userId, {
                    ...item,
                    recordId,
                });
                createdIds.symptoms.push(String(created._id));
            }
            for (const item of medicationsList) {
                const created = await medicationsService.createMedication(userId, {
                    ...item,
                    recordId,
                });
                createdIds.medications.push(String(created._id));
            }
            for (const item of labTestsList) {
                const created = await labTestService.createLabTest(userId, {
                    ...item,
                    recordId,
                });
                createdIds.labTests.push(String(created._id));
            }
            for (const item of allergiesList) {
                const created = await allergyService.createAllergy(userId, {
                    ...item,
                    recordId,
                });
                createdIds.allergies.push(String(created._id));
            }
            for (const item of immunizationsList) {
                const created = await immunizationService.createImmunization(userId, {
                    ...item,
                    recordId,
                });
                createdIds.immunizations.push(String(created._id));
            }
            if (attachments?.length) {
                for (const file of attachments) {
                    const created = await medicalFileService.createMedicalFile(userId, {
                        ...file,
                        recordId,
                    });
                    createdIds.medicalFiles.push(String(created._id));
                }
            }
            for (const item of medicalFilesList) {
                if (!("url" in item) || !item.url)
                    continue;
                const created = await medicalFileService.createMedicalFile(userId, {
                    ...item,
                    recordId,
                });
                createdIds.medicalFiles.push(String(created._id));
            }
            const updatedRecord = await medicalRecordRepository.getRecordForUser(recordId, userId);
            return updatedRecord ?? record;
        }
        catch (error) {
            await Promise.allSettled(createdIds.vitals.map((id) => vitalsService.deleteVitals(userId, id)));
            await Promise.allSettled(createdIds.symptoms.map((id) => symptomsService.deleteSymptoms(userId, id)));
            await Promise.allSettled(createdIds.medications.map((id) => medicationsService.deleteMedication(userId, id)));
            await Promise.allSettled(createdIds.labTests.map((id) => labTestService.deleteLabTest(userId, id)));
            await Promise.allSettled(createdIds.allergies.map((id) => allergyService.deleteAllergy(userId, id)));
            await Promise.allSettled(createdIds.immunizations.map((id) => immunizationService.deleteImmunization(userId, id)));
            await Promise.allSettled(createdIds.medicalFiles.map((id) => medicalFileService.deleteMedicalFile(userId, id)));
            await medicalRecordRepository.deleteRecord(recordId, userId);
            throw error;
        }
    }
    async getRecordById(userId, recordId) {
        const record = await medicalRecordRepository.getRecordForUser(recordId, userId);
        if (!record)
            throw new apiError_1.default(404, "Medical record not found");
        return record;
    }
    async getAllRecords(userId, options) {
        return medicalRecordRepository.getAllForUser(userId, options);
    }
    async updateRecord(userId, recordId, data) {
        const existing = await medicalRecordRepository.getRecordForUser(recordId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Medical record not found");
        const updatePayload = { ...data };
        const newAttachments = data.attachments ?? [];
        if (newAttachments.length) {
            const existingAttachments = existing.attachments ?? [];
            const seen = new Set();
            updatePayload.attachments = [...existingAttachments, ...newAttachments].filter((item) => {
                const key = item.publicId ?? item.url;
                if (!key)
                    return true;
                if (seen.has(key))
                    return false;
                seen.add(key);
                return true;
            });
        }
        const updated = await medicalRecordRepository.updateRecord(recordId, userId, updatePayload);
        if (!updated)
            throw new apiError_1.default(500, "Failed to update medical record");
        if (newAttachments.length) {
            for (const file of newAttachments) {
                try {
                    await medicalFileService.createMedicalFile(userId, {
                        ...file,
                        recordId,
                    });
                }
                catch {
                    // Best-effort medical file creation; do not block updates.
                }
            }
        }
        return updated;
    }
    async deleteRecord(userId, recordId) {
        const existing = await medicalRecordRepository.getRecordForUser(recordId, userId);
        if (!existing)
            throw new apiError_1.default(404, "Medical record not found");
        const result = await medicalRecordRepository.deleteRecord(recordId, userId);
        if (!result)
            throw new apiError_1.default(500, "Failed to delete medical record");
        return true;
    }
}
exports.MedicalRecordService = MedicalRecordService;
