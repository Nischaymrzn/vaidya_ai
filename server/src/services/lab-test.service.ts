import ApiError from "../exceptions/apiError";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { LabTestRepository } from "../repositories/lab-test.repository";
import {
  CreateLabTestPayload,
  UpdateLabTestPayload,
} from "../dtos/lab-test.dto";

const labTestRepository = new LabTestRepository();
const medicalRecordRepository = new MedicalRecordRepository();

export class LabTestService {
  async createLabTest(userId: string, data: CreateLabTestPayload) {
    const { recordId, ...payload } = data;
    const labTest = await labTestRepository.create({ ...payload, userId });
    if (!labTest) throw new ApiError(500, "Failed to create lab test");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "lab_tests",
          refId: String(labTest._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return labTest;
  }

  async getLabTestById(userId: string, labTestId: string) {
    const labTest = await labTestRepository.getForUser(labTestId, userId);
    if (!labTest) throw new ApiError(404, "Lab test not found");
    return labTest;
  }

  async getAllLabTests(userId: string) {
    return labTestRepository.getAllForUser(userId);
  }

  async updateLabTest(
    userId: string,
    labTestId: string,
    data: UpdateLabTestPayload,
  ) {
    const existing = await labTestRepository.getForUser(labTestId, userId);
    if (!existing) throw new ApiError(404, "Lab test not found");

    const { recordId, ...payload } = data;
    const updated = await labTestRepository.update(
      labTestId,
      userId,
      payload,
    );
    if (!updated) throw new ApiError(500, "Failed to update lab test");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(
        recordId,
        userId,
        {
          type: "lab_tests",
          refId: String(existing._id),
        },
      );
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    return updated;
  }

  async deleteLabTest(userId: string, labTestId: string) {
    const existing = await labTestRepository.getForUser(labTestId, userId);
    if (!existing) throw new ApiError(404, "Lab test not found");

    const result = await labTestRepository.delete(labTestId, userId);
    if (!result) throw new ApiError(500, "Failed to delete lab test");

    await medicalRecordRepository.removeItemByRef(
      userId,
      "lab_tests",
      String(existing._id),
    );

    return true;
  }
}
