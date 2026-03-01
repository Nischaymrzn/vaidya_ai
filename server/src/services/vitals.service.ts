import ApiError from "../exceptions/apiError";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { VitalsRepository } from "../repositories/vitals.repository";
import {
  CreateVitalsPayload,
  UpdateVitalsPayload,
} from "../dtos/vitals.dto";
import { UserDataService } from "./user-data.service";
import type { VitalsDb } from "../models/vitals.model";
import type {
  VitalsSummary,
  VitalsSummaryCard,
  VitalsTrendPoint,
} from "../types/vitals-summary.types";
import { RiskAssessmentService } from "./risk-assessment.service";

const vitalsRepository = new VitalsRepository();
const medicalRecordRepository = new MedicalRecordRepository();
const userDataService = new UserDataService();

const toDate = (value?: unknown) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const pickTimestamp = (item: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const raw = item[field];
    if (typeof raw === "string" || raw instanceof Date) {
      const date = toDate(raw);
      if (date) return date.getTime();
    }
  }
  return 0;
};

const getItemDate = (item: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const date = toDate(item[field]);
    if (date) return date;
  }
  return null;
};

const formatSignedDelta = (value: number | null, suffix = "") =>
  value === null ? "N/A" : `${value > 0 ? "+" : ""}${value}${suffix}`;

type LatestDelta = {
  current: number | null;
  previous: number | null;
  change: number | null;
  currentDate: Date | null;
};

const getLatestDelta = <T,>(
  items: T[],
  getValue: (item: T) => number | undefined,
  getDate: (item: T) => Date | null,
): LatestDelta => {
  let current: number | undefined;
  let previous: number | undefined;
  let currentDate: Date | null = null;

  for (let i = items.length - 1; i >= 0; i -= 1) {
    const value = getValue(items[i]);
    if (typeof value !== "number") continue;
    if (current === undefined) {
      current = value;
      currentDate = getDate(items[i]);
      continue;
    }
    previous = value;
    break;
  }

  return {
    current: current ?? null,
    previous: previous ?? null,
    change:
      current !== undefined && previous !== undefined ? current - previous : null,
    currentDate,
  };
};

const buildAlignedSeries = (values: number[], length: number) => {
  const result: Array<number | null> = Array.from({ length }, () => null);
  if (!values.length) return result;

  const lastIndex = Math.max(0, length - 1);
  if (values.length === 1) {
    result[0] = values[0];
    if (lastIndex > 0) result[lastIndex] = values[0];
    return result;
  }

  values.forEach((value, index) => {
    const position = Math.round((index * lastIndex) / (values.length - 1));
    result[position] = value;
  });

  result[0] ??= values[0];
  result[lastIndex] ??= values[values.length - 1];
  return result;
};

const buildHeartRateStatus = (value?: number | null) => {
  if (typeof value !== "number") return "No data";
  if (value > 100) return "High";
  if (value < 60) return "Low";
  return "Normal";
};

const buildBloodPressureStatus = (
  systolic?: number | null,
  diastolic?: number | null,
) => {
  if (typeof systolic !== "number" || typeof diastolic !== "number") {
    return "No data";
  }
  if (systolic >= 140 || diastolic >= 90) return "High";
  if (systolic >= 130 || diastolic >= 80) return "Elevated";
  if (systolic < 90 || diastolic < 60) return "Low";
  return "Normal";
};

const buildGlucoseStatus = (value?: number | null) => {
  if (typeof value !== "number") return "No data";
  if (value >= 126) return "High";
  if (value >= 100) return "Borderline";
  if (value < 70) return "Low";
  return "Normal";
};

const buildBmiStatus = (value?: number | null) => {
  if (typeof value !== "number") return "No data";
  if (value >= 30) return "High";
  if (value >= 25) return "Elevated";
  if (value < 18.5) return "Low";
  return "Normal";
};
const riskAssessmentService = new RiskAssessmentService();

export class VitalsService {
  async createVitals(userId: string, data: CreateVitalsPayload) {
    const { recordId, ...payload } = data;
    const vitals = await vitalsRepository.create({
      ...payload,
      userId,
      ...(recordId ? { recordId } : {}),
    });
    if (!vitals) throw new ApiError(500, "Failed to create vitals");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
        type: "vitals",
        refId: String(vitals._id),
      });
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    await userDataService.updateLatestVitals(userId, vitals);

    void riskAssessmentService
      .generateAssessment(userId, {
        useLatest: true,
        includeAi: false,
        maxInsights: 2,
      })
      .catch(() => undefined);
    return vitals;
  }

  async getVitalsById(userId: string, vitalsId: string) {
    const vitals = await vitalsRepository.getForUser(vitalsId, userId);
    if (!vitals) throw new ApiError(404, "Vitals not found");
    return vitals;
  }

  async getAllVitals(userId: string) {
    return vitalsRepository.getAllForUser(userId);
  }

  async updateVitals(
    userId: string,
    vitalsId: string,
    data: UpdateVitalsPayload,
  ) {
    const existing = await vitalsRepository.getForUser(vitalsId, userId);
    if (!existing) throw new ApiError(404, "Vitals not found");

    const { recordId, ...payload } = data;
    const updated = await vitalsRepository.update(vitalsId, userId, {
      ...payload,
      ...(recordId ? { recordId } : {}),
    });
    if (!updated) throw new ApiError(500, "Failed to update vitals");

    if (recordId) {
      const updatedRecord = await medicalRecordRepository.addItem(recordId, userId, {
        type: "vitals",
        refId: String(existing._id),
      });
      if (!updatedRecord) throw new ApiError(404, "Medical record not found");
    }

    await userDataService.updateLatestVitals(userId, updated ?? existing);

    void riskAssessmentService
      .generateAssessment(userId, {
        useLatest: true,
        includeAi: false,
        maxInsights: 2,
      })
      .catch(() => undefined);

    return updated;
  }

  async deleteVitals(userId: string, vitalsId: string) {
    const existing = await vitalsRepository.getForUser(vitalsId, userId);
    if (!existing) throw new ApiError(404, "Vitals not found");

    const result = await vitalsRepository.delete(vitalsId, userId);
    if (!result) throw new ApiError(500, "Failed to delete vitals");

    await medicalRecordRepository.removeItemByRef(
      userId,
      "vitals",
      String(existing._id),
    );

    const latest = await vitalsRepository.getLatestForUser(userId);
    if (latest) {
      await userDataService.updateLatestVitals(userId, latest);
    } else {
      await userDataService.updateLatestVitals(userId, null);
    }

    return true;
  }

  async getSummary(userId: string): Promise<VitalsSummary> {
    const vitals = await vitalsRepository.getAllForUser(userId);
    const sortedVitals = [...vitals].sort(
      (a, b) =>
        pickTimestamp(b as Record<string, unknown>, ["recordedAt", "createdAt"]) -
        pickTimestamp(a as Record<string, unknown>, ["recordedAt", "createdAt"]),
    );
    const sortedVitalsAsc = [...sortedVitals].reverse();

    const trendVitals = sortedVitalsAsc.filter(
      (vital) =>
        typeof vital.heartRate === "number" ||
        typeof vital.systolicBp === "number" ||
        typeof vital.glucoseLevel === "number",
    );

    const getVitalDate = (vital: VitalsDb) =>
      getItemDate(vital as Record<string, unknown>, [
        "recordedAt",
        "createdAt",
      ]);

    const heartRateValues = trendVitals
      .map((vital) => vital.heartRate)
      .filter((value): value is number => typeof value === "number");
    const systolicValues = trendVitals
      .map((vital) => vital.systolicBp)
      .filter((value): value is number => typeof value === "number");
    const glucoseValues = trendVitals
      .map((vital) => vital.glucoseLevel)
      .filter((value): value is number => typeof value === "number");

    const maxPoints = Math.max(
      2,
      heartRateValues.length,
      systolicValues.length,
      glucoseValues.length,
    );

    const alignedHeartRate = buildAlignedSeries(heartRateValues, maxPoints);
    const alignedSystolic = buildAlignedSeries(systolicValues, maxPoints);
    const alignedGlucose = buildAlignedSeries(glucoseValues, maxPoints);

    const trend: VitalsTrendPoint[] = Array.from(
      { length: maxPoints },
      (_, index) => ({
        label: index === 0 ? "Start" : index === maxPoints - 1 ? "Latest" : "",
        heartRate: alignedHeartRate[index],
        systolic: alignedSystolic[index],
        glucose: alignedGlucose[index],
      }),
    );

    const heartRateDelta = getLatestDelta(
      trendVitals,
      (vital) => vital.heartRate,
      getVitalDate,
    );
    const systolicDelta = getLatestDelta(
      trendVitals,
      (vital) => vital.systolicBp,
      getVitalDate,
    );
    const diastolicDelta = getLatestDelta(
      trendVitals,
      (vital) => vital.diastolicBp,
      getVitalDate,
    );
    const glucoseDelta = getLatestDelta(
      trendVitals,
      (vital) => vital.glucoseLevel,
      getVitalDate,
    );
    const bmiDelta = getLatestDelta(
      sortedVitalsAsc,
      (vital) => vital.bmi,
      getVitalDate,
    );

    const bpValue =
      systolicDelta.current !== null && diastolicDelta.current !== null
        ? `${systolicDelta.current}/${diastolicDelta.current}`
        : systolicDelta.current !== null
          ? `${systolicDelta.current}`
          : diastolicDelta.current !== null
            ? `${diastolicDelta.current}`
            : "N/A";

    const bpDeltaValue =
      systolicDelta.change !== null && diastolicDelta.change !== null
        ? `${formatSignedDelta(systolicDelta.change, " mmHg")} / ${formatSignedDelta(
            diastolicDelta.change,
            " mmHg",
          )}`
        : systolicDelta.change !== null
          ? `${formatSignedDelta(systolicDelta.change, " mmHg")}`
          : diastolicDelta.change !== null
            ? `${formatSignedDelta(diastolicDelta.change, " mmHg")}`
            : "No previous reading";

    const cards: VitalsSummaryCard[] = [
      {
        key: "heartRate",
        label: "Heart Rate",
        value:
          heartRateDelta.current !== null
            ? `${heartRateDelta.current}`
            : "N/A",
        unit: "bpm",
        status: buildHeartRateStatus(heartRateDelta.current),
        delta:
          heartRateDelta.change !== null
            ? formatSignedDelta(heartRateDelta.change, " bpm")
            : "No previous reading",
        updatedAt: heartRateDelta.currentDate?.toISOString() ?? null,
      },
      {
        key: "bloodPressure",
        label: "Blood Pressure",
        value: bpValue,
        unit: "mmHg",
        status: buildBloodPressureStatus(
          systolicDelta.current,
          diastolicDelta.current,
        ),
        delta: bpDeltaValue,
        updatedAt:
          systolicDelta.currentDate?.toISOString() ??
          diastolicDelta.currentDate?.toISOString() ??
          null,
      },
      {
        key: "glucose",
        label: "Blood Sugar",
        value:
          glucoseDelta.current !== null ? `${glucoseDelta.current}` : "N/A",
        unit: "mg/dL",
        status: buildGlucoseStatus(glucoseDelta.current),
        delta:
          glucoseDelta.change !== null
            ? formatSignedDelta(glucoseDelta.change, " mg/dL")
            : "No previous reading",
        updatedAt: glucoseDelta.currentDate?.toISOString() ?? null,
      },
      {
        key: "bmi",
        label: "BMI",
        value: bmiDelta.current !== null ? `${bmiDelta.current}` : "N/A",
        unit: "kg/m²",
        status: buildBmiStatus(bmiDelta.current),
        delta:
          bmiDelta.change !== null
            ? formatSignedDelta(bmiDelta.change)
            : "No previous reading",
        updatedAt: bmiDelta.currentDate?.toISOString() ?? null,
      },
    ];

    return {
      cards,
      trend,
      records: sortedVitals,
    };
  }
}
