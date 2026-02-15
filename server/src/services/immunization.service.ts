import ApiError from "../exceptions/apiError";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { ImmunizationRepository } from "../repositories/immunization.repository";
import {
  CreateImmunizationPayload,
  UpdateImmunizationPayload,
} from "../dtos/immunization.dto";
import { NotificationService } from "./notification.service";

const immunizationRepository = new ImmunizationRepository();
const medicalRecordRepository = new MedicalRecordRepository();
const notificationService = new NotificationService();

export class ImmunizationService {
  async createImmunization(userId: string, data: CreateImmunizationPayload) {
    const { recordId, ...payload } = data;
    const immunization = await immunizationRepository.create({
      ...payload,
      userId,
    });
    if (!immunization) throw new ApiError(500, "Failed to create immunization");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "immunizations",
          refId: String(immunization._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    try {
      await notificationService.createNotification(userId, {
        type: "immunization_added",
        title: "Immunization added",
        message: `Immunization recorded: ${immunization.vaccineName}.`,
        data: { immunizationId: String(immunization._id) },
      });
    } catch {
      // Best-effort notification; do not block creation.
    }

    return immunization;
  }

  async getImmunizationById(userId: string, immunizationId: string) {
    const immunization = await immunizationRepository.getForUser(
      immunizationId,
      userId,
    );
    if (!immunization) throw new ApiError(404, "Immunization not found");
    return immunization;
  }

  async getAllImmunizations(userId: string) {
    return immunizationRepository.getAllForUser(userId);
  }

  async updateImmunization(
    userId: string,
    immunizationId: string,
    data: UpdateImmunizationPayload,
  ) {
    const existing = await immunizationRepository.getForUser(
      immunizationId,
      userId,
    );
    if (!existing) throw new ApiError(404, "Immunization not found");

    const { recordId, ...payload } = data;
    const updated = await immunizationRepository.update(
      immunizationId,
      userId,
      payload,
    );
    if (!updated) throw new ApiError(500, "Failed to update immunization");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "immunizations",
          refId: String(existing._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return updated;
  }

  async deleteImmunization(userId: string, immunizationId: string) {
    const existing = await immunizationRepository.getForUser(
      immunizationId,
      userId,
    );
    if (!existing) throw new ApiError(404, "Immunization not found");

    const result = await immunizationRepository.delete(
      immunizationId,
      userId,
    );
    if (!result) throw new ApiError(500, "Failed to delete immunization");

    await medicalRecordRepository.removeItemByRef(
      userId,
      "immunizations",
      String(existing._id),
    );

    return true;
  }
}
