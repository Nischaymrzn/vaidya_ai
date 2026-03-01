import { UpdateUserDataDto } from "../dtos/user-data.dto";
import { UserDataRepository } from "../repositories/user-data.repository";
import type { VitalsDb } from "../models/vitals.model";

const userDataRepository = new UserDataRepository();

export class UserDataService {
  async ensureUserData(userId: string) {
    return userDataRepository.upsert(userId, { $setOnInsert: {} });
  }

  async getUserData(userId: string) {
    const existing = await userDataRepository.getByUserId(userId);
    if (existing) return existing;
    return this.ensureUserData(userId);
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
        $unset: { latestVitals: "", vitals: "" },
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

    const existing = await userDataRepository.getByUserId(userId);
    const existingVitals = existing?.vitals ?? existing?.latestVitals ?? null;
    const latestRecordedAt = existing?.latestVitals?.recordedAt
      ? new Date(existing.latestVitals.recordedAt).getTime()
      : 0;
    const newRecordedAt = latestVitals.recordedAt
      ? new Date(latestVitals.recordedAt).getTime()
      : 0;
    const refId = latestVitals.refId ? String(latestVitals.refId) : "";
    const isLatestRef =
      !!refId &&
      !!existing?.latestVitals?.refId &&
      String(existing.latestVitals.refId) === refId;

    const shouldUpdateLatest =
      !existing?.latestVitals ||
      isLatestRef ||
      (newRecordedAt && newRecordedAt >= latestRecordedAt);

    if (!shouldUpdateLatest) {
      return existing ?? userDataRepository.getByUserId(userId);
    }

    const mergeNumber = (
      next?: number | null,
      prev?: number | null,
    ) => (typeof next === "number" ? next : typeof prev === "number" ? prev : undefined);

    const mergedVitals = {
      refId: latestVitals.refId ?? existingVitals?.refId,
      recordedAt: latestVitals.recordedAt ?? existingVitals?.recordedAt,
      systolicBp: mergeNumber(latestVitals.systolicBp, existingVitals?.systolicBp),
      diastolicBp: mergeNumber(latestVitals.diastolicBp, existingVitals?.diastolicBp),
      glucoseLevel: mergeNumber(latestVitals.glucoseLevel, existingVitals?.glucoseLevel),
      heartRate: mergeNumber(latestVitals.heartRate, existingVitals?.heartRate),
      weight: mergeNumber(latestVitals.weight, existingVitals?.weight),
      height: mergeNumber(latestVitals.height, existingVitals?.height),
      bmi: mergeNumber(latestVitals.bmi, existingVitals?.bmi),
    };

    const updateFields: Record<string, unknown> = {
      latestVitals: mergedVitals,
      vitals: mergedVitals,
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
