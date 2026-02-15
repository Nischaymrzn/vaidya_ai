import ApiError from "../exceptions/apiError";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { MedicalFileRepository } from "../repositories/medical-file.repository";
import {
  CreateMedicalFilePayload,
  UpdateMedicalFilePayload,
} from "../dtos/medical-file.dto";

const medicalFileRepository = new MedicalFileRepository();
const medicalRecordRepository = new MedicalRecordRepository();

export class MedicalFileService {
  async createMedicalFile(
    userId: string,
    data: CreateMedicalFilePayload & {
      url: string;
      publicId?: string;
      type?: string;
      name?: string;
      size?: number;
    },
  ) {
    const { recordId, ...payload } = data;
    const medicalFile = await medicalFileRepository.create({
      ...payload,
      userId,
    });
    if (!medicalFile) throw new ApiError(500, "Failed to create medical file");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "medical_files",
          refId: String(medicalFile._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return medicalFile;
  }

  async getMedicalFileById(userId: string, fileId: string) {
    const medicalFile = await medicalFileRepository.getForUser(fileId, userId);
    if (!medicalFile) throw new ApiError(404, "Medical file not found");
    return medicalFile;
  }

  async getAllMedicalFiles(userId: string) {
    return medicalFileRepository.getAllForUser(userId);
  }

  async updateMedicalFile(
    userId: string,
    fileId: string,
    data: UpdateMedicalFilePayload,
  ) {
    const existing = await medicalFileRepository.getForUser(fileId, userId);
    if (!existing) throw new ApiError(404, "Medical file not found");

    const { recordId, ...payload } = data;
    const updated = await medicalFileRepository.update(fileId, userId, payload);
    if (!updated) throw new ApiError(500, "Failed to update medical file");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "medical_files",
          refId: String(existing._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return updated;
  }

  async deleteMedicalFile(userId: string, fileId: string) {
    const existing = await medicalFileRepository.getForUser(fileId, userId);
    if (!existing) throw new ApiError(404, "Medical file not found");

    const result = await medicalFileRepository.delete(fileId, userId);
    if (!result) throw new ApiError(500, "Failed to delete medical file");

    await medicalRecordRepository.removeItemByRef(
      userId,
      "medical_files",
      String(existing._id),
    );

    return true;
  }
}
