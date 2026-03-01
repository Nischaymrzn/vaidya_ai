import { Allergy } from "../models/allergy.model";
import { Immunization } from "../models/immunization.model";
import { MedicalRecord } from "../models/medical-record.model";
import { Medications } from "../models/medications.model";
import { Symptoms } from "../models/symptoms.model";
import type { AnalyticsSummary } from "../types/analytics.types";

const DEFAULT_MONTHS = 12;
const MAX_MONTHS = 24;
const MEDICATION_MONTHS = 8;
const IMMUNIZATION_MONTHS = 6;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toDate = (value?: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pickDate = (record: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const value = record[field];
    const date = toDate(value as Date | string | null | undefined);
    if (date) return date;
  }
  return null;
};

const toKey = (value?: string | null) =>
  value?.toString().trim().toLowerCase() || "";

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildMonthlyBuckets = (months: number, endDate: Date) => {
  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth() - (months - 1),
    1,
  );
  const buckets = Array.from({ length: months }, (_, index) => {
    const monthStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + index,
      1,
    );
    const monthEnd = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + index + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const yearSuffix =
      monthStart.getFullYear() === endDate.getFullYear()
        ? ""
        : ` '${String(monthStart.getFullYear()).slice(-2)}`;
    const label =
      monthStart.toLocaleDateString("en-US", { month: "short" }) + yearSuffix;

    return {
      key: monthKey(monthStart),
      label,
      start: monthStart,
      end: monthEnd,
    };
  });

  const rangeEnd = new Date(
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return { startDate, endDate: rangeEnd, buckets };
};

const getBucketIndex = (date: Date, startDate: Date, months: number) => {
  const diff =
    (date.getFullYear() - startDate.getFullYear()) * 12 +
    (date.getMonth() - startDate.getMonth());
  if (diff < 0 || diff >= months) return null;
  return diff;
};

const includesKeyword = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

type EncounterBucketKey = "outpatient" | "telehealth" | "inpatient";
type ImmunizationBucketKey = "routine" | "booster" | "travel";

const classifyEncounter = (value: string): EncounterBucketKey => {
  const normalized = value.toLowerCase();
  if (includesKeyword(normalized, ["tele", "virtual", "video", "remote"])) {
    return "telehealth";
  }
  if (includesKeyword(normalized, ["inpatient", "admission", "hospital", "icu"])) {
    return "inpatient";
  }
  return "outpatient";
};

const classifyProcedure = (value: string) => {
  const normalized = value.toLowerCase();
  if (includesKeyword(normalized, ["lab", "blood", "panel", "test"])) {
    return "Lab Panels";
  }
  if (includesKeyword(normalized, ["imaging", "x-ray", "xray", "ct", "mri", "ultrasound", "scan"])) {
    return "Imaging";
  }
  if (includesKeyword(normalized, ["ecg", "ekg", "electrocardio"])) {
    return "ECG";
  }
  if (includesKeyword(normalized, ["physio", "therapy", "rehab"])) {
    return "Therapy";
  }
  if (includesKeyword(normalized, ["endoscopy", "colonoscopy", "scope"])) {
    return "Endoscopy";
  }
  if (includesKeyword(normalized, ["surgery", "procedure", "operation"])) {
    return "Surgery";
  }
  return "Other";
};

const classifyImmunization = (value: string): ImmunizationBucketKey => {
  const normalized = value.toLowerCase();
  if (
    includesKeyword(normalized, [
      "travel",
      "yellow fever",
      "typhoid",
      "rabies",
      "japanese encephalitis",
      "cholera",
    ])
  ) {
    return "travel";
  }
  if (includesKeyword(normalized, ["booster", "bivalent"])) {
    return "booster";
  }
  return "routine";
};

export class AnalyticsService {
  async getSummary(userId: string, months = DEFAULT_MONTHS): Promise<AnalyticsSummary> {
    const now = new Date();
    const periodMonths = clamp(months, 1, MAX_MONTHS);
    const encounterBuckets = buildMonthlyBuckets(periodMonths, now);
    const medicationBuckets = buildMonthlyBuckets(
      Math.min(MEDICATION_MONTHS, periodMonths),
      now,
    );
    const immunizationBuckets = buildMonthlyBuckets(
      Math.min(IMMUNIZATION_MONTHS, periodMonths),
      now,
    );

    const [
      medicalRecords,
      symptoms,
      medications,
      immunizations,
      allergies,
    ] = await Promise.all([
      MedicalRecord.find(
        { userId, $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] },
        "recordDate createdAt diagnosis visitType recordType category provider title notes",
      ).lean(),
      Symptoms.find(
        { userId },
        "diagnosis disease symptomList loggedAt createdAt severity",
      ).lean(),
      Medications.find(
        { userId },
        "medicineName startDate endDate createdAt",
      ).lean(),
      Immunization.find(
        { userId },
        "vaccineName date series notes nextDue provider createdAt",
      ).lean(),
      Allergy.find({ userId }, "severity status recordedAt createdAt").lean(),
    ]);

    const conditionMap = new Map<string, { name: string; count: number }>();
    const recentConditionMap = new Map<string, number>();
    const recentCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const addCondition = (value?: string | null, date?: Date | null) => {
      if (!value) return;
      const key = toKey(value);
      if (!key) return;
      const displayName = value.trim();
      const existing = conditionMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        conditionMap.set(key, { name: displayName, count: 1 });
      }
      if (date && date >= recentCutoff) {
        recentConditionMap.set(key, (recentConditionMap.get(key) ?? 0) + 1);
      }
    };

    medicalRecords.forEach((record) => {
      const date = pickDate(record as Record<string, unknown>, [
        "recordDate",
        "createdAt",
      ]);
      addCondition(record.diagnosis as string | undefined, date);
    });

    symptoms.forEach((entry) => {
      const date = pickDate(entry as Record<string, unknown>, [
        "loggedAt",
        "createdAt",
      ]);
      addCondition(entry.diagnosis as string | undefined, date);
      addCondition(entry.disease as string | undefined, date);
    });

    const topConditions = Array.from(conditionMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const encounterHistory = encounterBuckets.buckets.map((bucket) => ({
      month: bucket.label,
      outpatient: 0,
      telehealth: 0,
      inpatient: 0,
    }));

    let totalEncounters = 0;
    const encounterTotals: Record<EncounterBucketKey, number> = {
      outpatient: 0,
      telehealth: 0,
      inpatient: 0,
    };
    let telehealthVisits = 0;

    medicalRecords.forEach((record) => {
      const date = pickDate(record as Record<string, unknown>, [
        "recordDate",
        "createdAt",
      ]);
      if (!date) return;
      const bucketIndex = getBucketIndex(
        date,
        encounterBuckets.startDate,
        encounterBuckets.buckets.length,
      );
      if (bucketIndex === null) return;
      const encounterLabel = `${record.visitType ?? ""} ${record.recordType ?? ""} ${record.category ?? ""}`;
      const classification = classifyEncounter(encounterLabel);
      encounterHistory[bucketIndex][classification] += 1;
      encounterTotals[classification] += 1;
      totalEncounters += 1;
      if (classification === "telehealth") telehealthVisits += 1;
    });

    const allergyCounts: Record<string, number> = {
      Mild: 0,
      Moderate: 0,
      Severe: 0,
      Unspecified: 0,
    };

    allergies.forEach((entry) => {
      const severity = toKey(entry.severity as string | undefined);
      if (severity === "mild") allergyCounts.Mild += 1;
      else if (severity === "moderate") allergyCounts.Moderate += 1;
      else if (severity === "severe") allergyCounts.Severe += 1;
      else allergyCounts.Unspecified += 1;
    });

    const allergySeverity = Object.entries(allergyCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const procedureCounts = new Map<string, number>();
    const incrementProcedure = (name: string) => {
      procedureCounts.set(name, (procedureCounts.get(name) ?? 0) + 1);
    };

    medicalRecords.forEach((record) => {
      const text = [
        record.recordType,
        record.category,
        record.title,
        record.notes,
      ]
        .filter(Boolean)
        .join(" ");
      const category = classifyProcedure(text);
      incrementProcedure(category);
    });

    const procedureBreakdown = Array.from(procedureCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const medicationHistory = medicationBuckets.buckets.map((bucket) => ({
      month: bucket.label,
      active: 0,
      new: 0,
      stopped: 0,
    }));

    const activeMedications = medications.filter((medication) => {
      const start =
        toDate(medication.startDate) ??
        pickDate(medication as Record<string, unknown>, ["createdAt"]);
      const end = toDate(medication.endDate);
      if (!start) return true;
      return start <= now && (!end || end >= now);
    }).length;

    let medicationChanges = 0;

    medications.forEach((medication) => {
      const start =
        toDate(medication.startDate) ??
        pickDate(medication as Record<string, unknown>, ["createdAt"]);
      const end = toDate(medication.endDate);

      if (start && start >= recentCutoff) medicationChanges += 1;
      if (end && end >= recentCutoff) medicationChanges += 1;

      medicationBuckets.buckets.forEach((bucket, index) => {
        if (start && start >= bucket.start && start <= bucket.end) {
          medicationHistory[index].new += 1;
        }
        if (end && end >= bucket.start && end <= bucket.end) {
          medicationHistory[index].stopped += 1;
        }
        if (start && start <= bucket.end && (!end || end >= bucket.start)) {
          medicationHistory[index].active += 1;
        }
      });
    });

    const immunizationHistory = immunizationBuckets.buckets.map((bucket) => ({
      month: bucket.label,
      routine: 0,
      booster: 0,
      travel: 0,
    }));

    const boostersDue = immunizations.filter((entry) => {
      const nextDue = toDate(entry.nextDue);
      if (!nextDue) return false;
      const dueCutoff = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      return nextDue >= now && nextDue <= dueCutoff;
    }).length;

    immunizations.forEach((entry) => {
      const date =
        toDate(entry.date) ??
        pickDate(entry as Record<string, unknown>, ["createdAt"]);
      if (!date) return;
      const bucketIndex = getBucketIndex(
        date,
        immunizationBuckets.startDate,
        immunizationBuckets.buckets.length,
      );
      if (bucketIndex === null) return;
      const classification = classifyImmunization(
        `${entry.vaccineName ?? ""} ${entry.series ?? ""} ${entry.notes ?? ""}`,
      );
      immunizationHistory[bucketIndex][classification] += 1;
    });

    const providerCounts = new Map<string, { name: string; count: number }>();
    const registerProvider = (name?: string | null) => {
      if (!name) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      const existing = providerCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        providerCounts.set(key, { name: trimmed, count: 1 });
      }
    };

    medicalRecords.forEach((record) => registerProvider(record.provider as string | undefined));
    immunizations.forEach((entry) => registerProvider(entry.provider as string | undefined));

    const topProviders = Array.from(providerCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const careTouchpoints = [
      ...medicalRecords.map((record) =>
        pickDate(record as Record<string, unknown>, ["recordDate", "createdAt"]),
      ),
      ...immunizations.map((entry) =>
        pickDate(entry as Record<string, unknown>, ["date", "createdAt"]),
      ),
    ].filter((date) => date && date >= recentCutoff).length;

    const currentYear = now.getFullYear();
    const referralsYtd = medicalRecords.filter((record) => {
      const date = pickDate(record as Record<string, unknown>, [
        "recordDate",
        "createdAt",
      ]);
      if (!date || date.getFullYear() !== currentYear) return false;
      const label = `${record.recordType ?? ""} ${record.category ?? ""} ${record.visitType ?? ""}`.toLowerCase();
      return label.includes("referral");
    }).length;

    return {
      dateRange: {
        start: encounterBuckets.startDate.toISOString(),
        end: now.toISOString(),
        months: periodMonths,
      },
      summary: {
        activeConditions: conditionMap.size,
        activeMedications,
        encounters: totalEncounters,
        immunizations: immunizations.length,
        notes: {
          recentConditions: recentConditionMap.size,
          medicationChanges,
          telehealthVisits,
          boostersDue,
        },
      },
      encounterTotals,
      encounterHistory,
      allergySeverity,
      topConditions,
      procedureBreakdown,
      medicationHistory,
      immunizationHistory,
      providerNetwork: {
        activeProviders: providerCounts.size,
        referralsYtd,
        careTouchpoints,
        topProviders,
      },
    };
  }
}
