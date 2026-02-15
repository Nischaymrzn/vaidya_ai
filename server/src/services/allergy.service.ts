import ApiError from "../exceptions/apiError";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { AllergyRepository } from "../repositories/allergy.repository";
import {
  CreateAllergyPayload,
  UpdateAllergyPayload,
} from "../dtos/allergy.dto";
import { NotificationService } from "./notification.service";

const allergyRepository = new AllergyRepository();
const medicalRecordRepository = new MedicalRecordRepository();
const notificationService = new NotificationService();

export class AllergyService {
  async createAllergy(userId: string, data: CreateAllergyPayload) {
    const { recordId, ...payload } = data;
    const allergy = await allergyRepository.create({ ...payload, userId });
    if (!allergy) throw new ApiError(500, "Failed to create allergy");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "allergies",
          refId: String(allergy._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    try {
      await notificationService.createNotification(userId, {
        type: "allergy_added",
        title: "Allergy added",
        message: `Allergy recorded: ${allergy.allergen}.`,
        data: { allergyId: String(allergy._id) },
      });
    } catch {
      // Best-effort notification; do not block creation.
    }

    return allergy;
  }

  async getAllergyById(userId: string, allergyId: string) {
    const allergy = await allergyRepository.getForUser(allergyId, userId);
    if (!allergy) throw new ApiError(404, "Allergy not found");
    return allergy;
  }

  async getAllAllergies(userId: string) {
    return allergyRepository.getAllForUser(userId);
  }

  async updateAllergy(
    userId: string,
    allergyId: string,
    data: UpdateAllergyPayload,
  ) {
    const existing = await allergyRepository.getForUser(allergyId, userId);
    if (!existing) throw new ApiError(404, "Allergy not found");

    const { recordId, ...payload } = data;
    const updated = await allergyRepository.update(allergyId, userId, payload);
    if (!updated) throw new ApiError(500, "Failed to update allergy");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "allergies",
          refId: String(existing._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return updated;
  }

  async deleteAllergy(userId: string, allergyId: string) {
    const existing = await allergyRepository.getForUser(allergyId, userId);
    if (!existing) throw new ApiError(404, "Allergy not found");

    const result = await allergyRepository.delete(allergyId, userId);
    if (!result) throw new ApiError(500, "Failed to delete allergy");

    await medicalRecordRepository.removeItemByRef(
      userId,
      "allergies",
      String(existing._id),
    );

    return true;
  }
}
