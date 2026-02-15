import ApiError from "../exceptions/apiError";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { SymptomsRepository } from "../repositories/symptoms.repository";
import {
  CreateSymptomsPayload,
  UpdateSymptomsPayload,
} from "../dtos/symptoms.dto";
import { RiskAssessmentService } from "./risk-assessment.service";

const symptomsRepository = new SymptomsRepository();
const medicalRecordRepository = new MedicalRecordRepository();
const riskAssessmentService = new RiskAssessmentService();

export class SymptomsService {
  async createSymptoms(userId: string, data: CreateSymptomsPayload) {
    const { recordId, ...payload } = data;
    const symptoms = await symptomsRepository.create({ ...payload, userId });
    if (!symptoms) throw new ApiError(500, "Failed to create symptoms");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "symptoms",
          refId: String(symptoms._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    void riskAssessmentService
      .generateAssessment(userId, {
        useLatest: true,
        includeAi: false,
        maxInsights: 2,
      })
      .catch(() => undefined);

    return symptoms;
  }

  async getSymptomsById(userId: string, symptomsId: string) {
    const symptoms = await symptomsRepository.getForUser(symptomsId, userId);
    if (!symptoms) throw new ApiError(404, "Symptoms not found");
    return symptoms;
  }

  async getAllSymptoms(userId: string) {
    return symptomsRepository.getAllForUser(userId);
  }

  async updateSymptoms(
    userId: string,
    symptomsId: string,
    data: UpdateSymptomsPayload,
  ) {
    const existing = await symptomsRepository.getForUser(symptomsId, userId);
    if (!existing) throw new ApiError(404, "Symptoms not found");

    const { recordId, ...payload } = data;
    const updated = await symptomsRepository.update(
      symptomsId,
      userId,
      payload,
    );
    if (!updated) throw new ApiError(500, "Failed to update symptoms");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "symptoms",
          refId: String(existing._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    void riskAssessmentService
      .generateAssessment(userId, {
        useLatest: true,
        includeAi: false,
        maxInsights: 2,
      })
      .catch(() => undefined);

    return updated;
  }

  async deleteSymptoms(userId: string, symptomsId: string) {
    const existing = await symptomsRepository.getForUser(symptomsId, userId);
    if (!existing) throw new ApiError(404, "Symptoms not found");

    const result = await symptomsRepository.delete(symptomsId, userId);
    if (!result) throw new ApiError(500, "Failed to delete symptoms");

    await medicalRecordRepository.removeItemByRef(
      userId,
      "symptoms",
      String(existing._id),
    );

    return true;
  }
}
