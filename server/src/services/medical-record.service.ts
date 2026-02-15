import ApiError from "../exceptions/apiError";
import {
  MedicalRecordRepository,
  PaginationParams,
} from "../repositories/medical-record.repository";
import {
  CreateMedicalRecordPayload,
  UpdateMedicalRecordPayload,
} from "../dtos/medical-record.dto";
import { VitalsService } from "./vitals.service";
import { SymptomsService } from "./symptoms.service";
import { MedicationsService } from "./medications.service";
import { LabTestService } from "./lab-test.service";
import { MedicalFileService } from "./medical-file.service";
import { AllergyService } from "./allergy.service";
import { ImmunizationService } from "./immunization.service";
import { NotificationService } from "./notification.service";
import { MedicalRecordAttachment } from "../types/medical-record.types";

const medicalRecordRepository = new MedicalRecordRepository();
const vitalsService = new VitalsService();
const symptomsService = new SymptomsService();
const medicationsService = new MedicationsService();
const labTestService = new LabTestService();
const medicalFileService = new MedicalFileService();
const allergyService = new AllergyService();
const immunizationService = new ImmunizationService();
const notificationService = new NotificationService();

const asArray = <T>(value?: T | T[]) =>
  value ? (Array.isArray(value) ? value : [value]) : [];

const isEmptyObject = (value: unknown) =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value as Record<string, unknown>).length === 0;

export class MedicalRecordService {
  async createRecord(userId: string, data: CreateMedicalRecordPayload) {
    const {
      vitals,
      symptoms,
      medications,
      labTests,
      medicalFiles,
      allergies,
      immunizations,
      attachments,
      ...recordData
    } = data;

    const record = await medicalRecordRepository.createRecord({
      ...recordData,
      userId,
      attachments,
    });
    if (!record) throw new ApiError(500, "Failed to create medical record");

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
    } catch {
      // Best-effort notification; do not block record creation.
    }

    const recordId = String(record._id);

    const vitalsList = asArray(vitals).filter((item) => !isEmptyObject(item));
    const symptomsList = asArray(symptoms).filter(
      (item) => !isEmptyObject(item),
    );
    const medicationsList = asArray(medications).filter(
      (item) => !isEmptyObject(item),
    );
    const labTestsList = asArray(labTests).filter(
      (item) => !isEmptyObject(item),
    );
    const medicalFilesList = asArray(medicalFiles).filter(
      (item) => !isEmptyObject(item),
    );
    const allergiesList = asArray(allergies).filter(
      (item) => !isEmptyObject(item),
    );
    const immunizationsList = asArray(immunizations).filter(
      (item) => !isEmptyObject(item),
    );

    const createdIds = {
      vitals: [] as string[],
      symptoms: [] as string[],
      medications: [] as string[],
      labTests: [] as string[],
      medicalFiles: [] as string[],
      allergies: [] as string[],
      immunizations: [] as string[],
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
        for (const file of attachments as MedicalRecordAttachment[]) {
          const created = await medicalFileService.createMedicalFile(userId, {
            ...file,
            recordId,
          });
          createdIds.medicalFiles.push(String(created._id));
        }
      }

      for (const item of medicalFilesList) {
        if (!("url" in item) || !item.url) continue;
        const created = await medicalFileService.createMedicalFile(userId, {
          ...item,
          recordId,
        });
        createdIds.medicalFiles.push(String(created._id));
      }

      const updatedRecord = await medicalRecordRepository.getRecordForUser(
        recordId,
        userId,
      );
      return updatedRecord ?? record;
    } catch (error) {
      await Promise.allSettled(
        createdIds.vitals.map((id) => vitalsService.deleteVitals(userId, id)),
      );
      await Promise.allSettled(
        createdIds.symptoms.map((id) =>
          symptomsService.deleteSymptoms(userId, id),
        ),
      );
      await Promise.allSettled(
        createdIds.medications.map((id) =>
          medicationsService.deleteMedication(userId, id),
        ),
      );
      await Promise.allSettled(
        createdIds.labTests.map((id) => labTestService.deleteLabTest(userId, id)),
      );
      await Promise.allSettled(
        createdIds.allergies.map((id) =>
          allergyService.deleteAllergy(userId, id),
        ),
      );
      await Promise.allSettled(
        createdIds.immunizations.map((id) =>
          immunizationService.deleteImmunization(userId, id),
        ),
      );
      await Promise.allSettled(
        createdIds.medicalFiles.map((id) =>
          medicalFileService.deleteMedicalFile(userId, id),
        ),
      );
      await medicalRecordRepository.deleteRecord(recordId, userId);
      throw error;
    }
  }

  async getRecordById(userId: string, recordId: string) {
    const record = await medicalRecordRepository.getRecordForUser(
      recordId,
      userId,
    );
    if (!record) throw new ApiError(404, "Medical record not found");
    return record;
  }

  async getAllRecords(userId: string, options?: PaginationParams) {
    return medicalRecordRepository.getAllForUser(userId, options);
  }

  async updateRecord(
    userId: string,
    recordId: string,
    data: UpdateMedicalRecordPayload,
  ) {
    const existing = await medicalRecordRepository.getRecordForUser(
      recordId,
      userId,
    );
    if (!existing) throw new ApiError(404, "Medical record not found");
    const updatePayload: UpdateMedicalRecordPayload = { ...data };
    const newAttachments = data.attachments ?? [];
    if (newAttachments.length) {
      const existingAttachments = existing.attachments ?? [];
      const seen = new Set<string>();
      updatePayload.attachments = [...existingAttachments, ...newAttachments].filter(
        (item) => {
          const key = item.publicId ?? item.url;
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        },
      );
    }

    const updated = await medicalRecordRepository.updateRecord(
      recordId,
      userId,
      updatePayload,
    );
    if (!updated) throw new ApiError(500, "Failed to update medical record");

    if (newAttachments.length) {
      for (const file of newAttachments) {
        try {
          await medicalFileService.createMedicalFile(userId, {
            ...file,
            recordId,
          });
        } catch {
          // Best-effort medical file creation; do not block updates.
        }
      }
    }
    return updated;
  }

  async deleteRecord(userId: string, recordId: string) {
    const existing = await medicalRecordRepository.getRecordForUser(
      recordId,
      userId,
    );
    if (!existing) throw new ApiError(404, "Medical record not found");
    const result = await medicalRecordRepository.deleteRecord(recordId, userId);
    if (!result) throw new ApiError(500, "Failed to delete medical record");
    return true;
  }
}
