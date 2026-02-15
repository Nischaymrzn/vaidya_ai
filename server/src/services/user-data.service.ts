import { UpdateUserDataDto } from "../dtos/user-data.dto";
import { UserDataRepository } from "../repositories/user-data.repository";
import type { VitalsDb } from "../models/vitals.model";

const userDataRepository = new UserDataRepository();

export class UserDataService {
  async getUserData(userId: string) {
    return userDataRepository.getByUserId(userId);
  }

  async updateUserData(userId: string, data: UpdateUserDataDto) {
    if (!Object.keys(data).length) {
      return userDataRepository.getByUserId(userId);
    }
    return userDataRepository.upsert(userId, { $set: data });
  }

  async updateLatestVitals(
    userId: string,
    vitals?: (Partial<VitalsDb> & { createdAt?: Date }) | null,
  ) {
    if (!vitals) {
      return userDataRepository.upsert(userId, {
        $unset: { latestVitals: "" },
      });
    }

    const latestVitals = {
      refId: vitals._id,
      recordedAt: vitals.recordedAt ?? vitals.createdAt,
      systolicBp: vitals.systolicBp,
      diastolicBp: vitals.diastolicBp,
      glucoseLevel: vitals.glucoseLevel,
      heartRate: vitals.heartRate,
      weight: vitals.weight,
      height: vitals.height,
      bmi: vitals.bmi,
    };

    const updateFields: Record<string, unknown> = {
      latestVitals,
    };
    if (typeof vitals.weight === "number") {
      updateFields.weightKg = vitals.weight;
    }
    if (typeof vitals.height === "number") {
      updateFields.heightCm = vitals.height;
    }

    return userDataRepository.upsert(userId, {
      $set: updateFields,
      $setOnInsert: { userId },
    });
  }
}
