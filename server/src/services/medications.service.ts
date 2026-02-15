import ApiError from "../exceptions/apiError";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { MedicationsRepository } from "../repositories/medications.repository";
import {
  CreateMedicationsPayload,
  UpdateMedicationsPayload,
} from "../dtos/medications.dto";

const medicationsRepository = new MedicationsRepository();
const medicalRecordRepository = new MedicalRecordRepository();

export class MedicationsService {
  async createMedication(userId: string, data: CreateMedicationsPayload) {
    const { recordId, ...payload } = data;
    const medication = await medicationsRepository.create({ ...payload, userId });
    if (!medication) throw new ApiError(500, "Failed to create medication");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "medications",
          refId: String(medication._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return medication;
  }

  async getMedicationById(userId: string, medicationId: string) {
    const medication = await medicationsRepository.getForUser(
      medicationId,
      userId,
    );
    if (!medication) throw new ApiError(404, "Medication not found");
    return medication;
  }

  async getAllMedications(userId: string) {
    return medicationsRepository.getAllForUser(userId);
  }

  async updateMedication(
    userId: string,
    medicationId: string,
    data: UpdateMedicationsPayload,
  ) {
    const existing = await medicationsRepository.getForUser(
      medicationId,
      userId,
    );
    if (!existing) throw new ApiError(404, "Medication not found");

    const { recordId, ...payload } = data;
    const updated = await medicationsRepository.update(
      medicationId,
      userId,
      payload,
    );
    if (!updated) throw new ApiError(500, "Failed to update medication");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "medications",
          refId: String(existing._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return updated;
  }

  async deleteMedication(userId: string, medicationId: string) {
    const existing = await medicationsRepository.getForUser(
      medicationId,
      userId,
    );
    if (!existing) throw new ApiError(404, "Medication not found");

    const result = await medicationsRepository.delete(medicationId, userId);
    if (!result) throw new ApiError(500, "Failed to delete medication");

    await medicalRecordRepository.removeItemByRef(
      userId,
      "medications",
      String(existing._id),
    );

    return true;
  }
}
