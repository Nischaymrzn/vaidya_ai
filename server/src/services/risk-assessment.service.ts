import ApiError from "../exceptions/apiError";
import {
  RiskAssessmentRepository,
} from "../repositories/risk-assessment.repository";
import {
  RiskVitalsRepository,
} from "../repositories/risk-vitals.repository";
import {
  RiskSymptomsRepository,
} from "../repositories/risk-symptoms.repository";
import {
  HealthInsightRepository,
} from "../repositories/health-insight.repository";
import {
  ReportInsightRepository,
} from "../repositories/report-insight.repository";
import { VitalsRepository } from "../repositories/vitals.repository";
import { SymptomsRepository } from "../repositories/symptoms.repository";
import { LabTestRepository } from "../repositories/lab-test.repository";
import { MedicationsRepository } from "../repositories/medications.repository";
import { UserDataRepository } from "../repositories/user-data.repository";
import type { VitalsDb } from "../models/vitals.model";
import type { SymptomsDb } from "../models/symptoms.model";
import type { LabTestDb } from "../models/lab-test.model";
import type { MedicationsDb } from "../models/medications.model";
import type { UserDataDb } from "../models/user-data.model";
import type { GenerateRiskAssessmentPayload } from "../dtos/risk-assessment.dto";
import mongoose from "mongoose";

const riskAssessmentRepository = new RiskAssessmentRepository();
const riskVitalsRepository = new RiskVitalsRepository();
const riskSymptomsRepository = new RiskSymptomsRepository();
const healthInsightRepository = new HealthInsightRepository();
const reportInsightRepository = new ReportInsightRepository();
const vitalsRepository = new VitalsRepository();
const symptomsRepository = new SymptomsRepository();
const labTestRepository = new LabTestRepository();
const medicationsRepository = new MedicationsRepository();
const userDataRepository = new UserDataRepository();

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const DEFAULT_RISK_COOLDOWN_HOURS = 6;
const DEFAULT_RECENT_VITALS_LIMIT = 10;
const DEFAULT_RECENT_SYMPTOMS_LIMIT = 10;
const DEFAULT_RISK_HISTORY_HOURS = 24;

const toNumber = (value?: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toDate = (value?: unknown) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const pickLatestDate = (
  item: Record<string, unknown> | null | undefined,
  fields: string[],
) => {
  if (!item) return undefined;
  for (const field of fields) {
    const candidate = toDate(item[field]);
    if (candidate) return candidate;
  }
  return undefined;
};

const maxDate = (dates: Array<Date | undefined>) => {
  const timestamps = dates
    .filter((date): date is Date => Boolean(date))
    .map((date) => date.getTime());
  if (!timestamps.length) return undefined;
  return new Date(Math.max(...timestamps));
};

const computeAge = (dob?: Date) => {
  if (!dob) return undefined;
  const birth = toDate(dob);
  if (!birth) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

const computeBmi = (weightKg?: number, heightCm?: number) => {
  if (!weightKg || !heightCm) return undefined;
  if (heightCm <= 0) return undefined;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number.isFinite(bmi) ? Math.round(bmi * 10) / 10 : undefined;
};

const selectMostRecent = <T extends Record<string, any>>(
  items: T[],
  fields: string[],
) => {
  if (!items.length) return undefined;
  let latest = items[0];
  let latestTime = -Infinity;
  items.forEach((item) => {
    const timestamps = fields
      .map((field) => toDate(item[field]))
      .filter((value): value is Date => Boolean(value));
    if (!timestamps.length && item.createdAt) {
      const created = toDate(item.createdAt);
      if (created) timestamps.push(created);
    }
    const itemTime = timestamps.length
      ? Math.max(...timestamps.map((date) => date.getTime()))
      : -Infinity;
    if (itemTime > latestTime) {
      latest = item;
      latestTime = itemTime;
    }
  });
  return latest;
};

const sortByLatestDateDesc = <T extends Record<string, any>>(
  items: T[],
  fields: string[],
) => {
  return [...items].sort((a, b) => {
    const aDate = pickLatestDate(a, fields);
    const bDate = pickLatestDate(b, fields);
    const aTs = aDate ? aDate.getTime() : 0;
    const bTs = bDate ? bDate.getTime() : 0;
    return bTs - aTs;
  });
};

const normalizeSeverity = (value?: string) =>
  value?.trim().toLowerCase();

const normalizePriority = (
  value?: string,
): "High" | "Medium" | "Low" | "Info" => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return "Info";
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";
  return "Info";
};

const buildRiskLevel = (riskScore: number) => {
  if (riskScore >= 70) return "High";
  if (riskScore >= 40) return "Medium";
  return "Low";
};

type RiskSignals = {
  age?: number;
  gender?: string;
  bmi?: number;
  systolicBp?: number;
  diastolicBp?: number;
  glucoseLevel?: number;
  heartRate?: number;
  symptomCount?: number;
  symptomSeverity?: string;
  symptomDurationDays?: number;
  labTestName?: string;
  labResultValue?: string;
  labUnit?: string;
  medicationConditions?: string[];
};

const computeRiskScore = (signals: RiskSignals) => {
  let score = 0;
  const factors: string[] = [];

  if (typeof signals.age === "number") {
    if (signals.age >= 65) {
      score += 15;
      factors.push("Age 65+");
    } else if (signals.age >= 50) {
      score += 10;
      factors.push("Age 50-64");
    } else if (signals.age >= 35) {
      score += 5;
      factors.push("Age 35-49");
    }
  }

  if (
    typeof signals.systolicBp === "number" &&
    typeof signals.diastolicBp === "number"
  ) {
    const systolic = signals.systolicBp;
    const diastolic = signals.diastolicBp;
    if (systolic >= 160 || diastolic >= 100) {
      score += 20;
      factors.push("Very high blood pressure");
    } else if (systolic >= 140 || diastolic >= 90) {
      score += 15;
      factors.push("High blood pressure");
    } else if (systolic >= 130 || diastolic >= 80) {
      score += 10;
      factors.push("Elevated blood pressure");
    } else if (systolic < 90 || diastolic < 60) {
      score += 8;
      factors.push("Low blood pressure");
    }
  }

  if (typeof signals.heartRate === "number") {
    if (signals.heartRate > 100 || signals.heartRate < 50) {
      score += 10;
      factors.push("Abnormal heart rate");
    } else if (signals.heartRate >= 90) {
      score += 5;
      factors.push("Elevated heart rate");
    }
  }

  if (typeof signals.glucoseLevel === "number") {
    if (signals.glucoseLevel >= 200) {
      score += 20;
      factors.push("Very high glucose");
    } else if (signals.glucoseLevel >= 126) {
      score += 12;
      factors.push("High glucose");
    } else if (signals.glucoseLevel >= 100) {
      score += 5;
      factors.push("Borderline glucose");
    } else if (signals.glucoseLevel < 70) {
      score += 8;
      factors.push("Low glucose");
    }
  }

  if (typeof signals.bmi === "number") {
    if (signals.bmi >= 35) {
      score += 15;
      factors.push("Severe obesity");
    } else if (signals.bmi >= 30) {
      score += 10;
      factors.push("Obesity");
    } else if (signals.bmi >= 25) {
      score += 5;
      factors.push("Overweight");
    } else if (signals.bmi < 18.5) {
      score += 5;
      factors.push("Underweight");
    }
  }

  if (typeof signals.symptomCount === "number") {
    if (signals.symptomCount >= 6) {
      score += 10;
      factors.push("Many symptoms");
    } else if (signals.symptomCount >= 3) {
      score += 5;
      factors.push("Multiple symptoms");
    }
  }

  if (typeof signals.symptomDurationDays === "number") {
    if (signals.symptomDurationDays >= 30) {
      score += 10;
      factors.push("Symptoms for 30+ days");
    } else if (signals.symptomDurationDays >= 14) {
      score += 5;
      factors.push("Symptoms for 14+ days");
    }
  }

  if (signals.symptomSeverity) {
    const severity = normalizeSeverity(signals.symptomSeverity);
    if (severity === "severe") {
      score += 15;
      factors.push("Severe symptoms");
    } else if (severity === "moderate") {
      score += 8;
      factors.push("Moderate symptoms");
    } else if (severity === "mild") {
      score += 3;
      factors.push("Mild symptoms");
    }
  }

  if (signals.labTestName && signals.labResultValue) {
    const labValue = toNumber(signals.labResultValue);
    const name = signals.labTestName.toLowerCase();
    if (name.includes("hba1c") && typeof labValue === "number") {
      if (labValue >= 6.5) {
        score += 15;
        factors.push("Elevated HbA1c");
      } else if (labValue >= 5.7) {
        score += 8;
        factors.push("Borderline HbA1c");
      }
    }
  }

  if (signals.medicationConditions?.length) {
    score += Math.min(signals.medicationConditions.length * 2, 10);
    factors.push("Conditions from medications");
  }

  return {
    score: clamp(score, 0, 100),
    factors,
  };
};

const computeVaidyaScore = (riskScore: number, signals: RiskSignals) => {
  let bonus = 0;
  if (
    typeof signals.systolicBp === "number" &&
    typeof signals.diastolicBp === "number" &&
    signals.systolicBp < 130 &&
    signals.diastolicBp < 80
  ) {
    bonus += 3;
  }
  if (typeof signals.glucoseLevel === "number" && signals.glucoseLevel < 100) {
    bonus += 3;
  }
  if (typeof signals.bmi === "number" && signals.bmi >= 18.5 && signals.bmi < 25) {
    bonus += 2;
  }
  if (typeof signals.symptomCount === "number" && signals.symptomCount === 0) {
    bonus += 2;
  }
  return clamp(Math.round((100 - riskScore + bonus) * 10) / 10, 0, 100);
};

const computeConfidence = (
  signals: RiskSignals,
  latestDates: Date[],
) => {
  const totalSignals = 8;
  let present = 0;
  if (typeof signals.age === "number") present += 1;
  if (typeof signals.systolicBp === "number") present += 1;
  if (typeof signals.diastolicBp === "number") present += 1;
  if (typeof signals.glucoseLevel === "number") present += 1;
  if (typeof signals.heartRate === "number") present += 1;
  if (typeof signals.bmi === "number") present += 1;
  if (typeof signals.symptomCount === "number") present += 1;
  if (signals.symptomSeverity) present += 1;

  const completeness = present / totalSignals;
  let confidence = 0.35 + completeness * 0.6;

  const now = Date.now();
  const mostRecent = latestDates.length
    ? Math.max(...latestDates.map((date) => date.getTime()))
    : 0;
  if (mostRecent > 0) {
    const days = (now - mostRecent) / (1000 * 60 * 60 * 24);
    if (days > 365) confidence -= 0.2;
    else if (days > 180) confidence -= 0.1;
  }

  return clamp(Math.round(confidence * 100) / 100, 0.2, 0.95);
};

const extractJson = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const geminiEndpoint =
  process.env.GEMINI_API_URL ??
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const buildRiskPrompt = (params: {
  riskScore: number;
  riskLevel: string;
  vaidyaScore: number;
  confidenceScore: number;
  factors: string[];
  signals: RiskSignals;
  notes?: string;
  maxInsights: number;
}) => {
  const payload = {
    scores: {
      riskScore: params.riskScore,
      riskLevel: params.riskLevel,
      vaidyaScore: params.vaidyaScore,
      confidenceScore: params.confidenceScore,
    },
    factors: params.factors,
    signals: params.signals,
    notes: params.notes,
  };

  return `
You are a health risk insights assistant for an informational wellness app.
Do not provide diagnosis or treatment. If riskLevel is High, recommend seeing a clinician.
Return JSON only.
JSON format:
{
  "predicted_condition": "string",
  "insights": [
    {
      "insight_title": "string",
      "description": "string",
      "priority": "High|Medium|Low|Info"
    }
  ]
}
Max insights: ${params.maxInsights}.
If data is insufficient, set predicted_condition to "Insufficient data" and keep insights minimal.
Input data:
${JSON.stringify(payload)}
`;
};

type AiInsight = {
  insight_title: string;
  description: string;
  priority?: string;
};

type AiRiskResponse = {
  predicted_condition?: string;
  insights?: AiInsight[];
};

const callGemini = async (prompt: string, useSchema: boolean) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const generationConfig: Record<string, unknown> = {
    temperature: 0.2,
    responseMimeType: "application/json",
  };

  if (useSchema) {
    generationConfig.responseJsonSchema = {
      type: "object",
      properties: {
        predicted_condition: { type: "string" },
        insights: {
          type: "array",
          items: {
            type: "object",
            properties: {
              insight_title: { type: "string" },
              description: { type: "string" },
              priority: { type: "string" },
            },
            required: ["insight_title", "description"],
          },
        },
      },
      required: ["predicted_condition", "insights"],
    };
  }

  try {
    const response = await fetch(`${geminiEndpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini error: ${response.status} ${response.statusText} ${errorText}`,
      );
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } finally {
    clearTimeout(timeout);
  }
};

const generateAiInsights = async (prompt: string) => {
  const useSchema = process.env.GEMINI_USE_JSON_SCHEMA !== "false";
  try {
    const text = await callGemini(prompt, useSchema);
    const parsed = extractJson(text) as AiRiskResponse | null;
    return parsed ?? null;
  } catch (error) {
    if (useSchema) {
      try {
        const text = await callGemini(prompt, false);
        const parsed = extractJson(text) as AiRiskResponse | null;
        return parsed ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }
};

const buildRuleBasedInsights = (
  signals: RiskSignals,
  riskLevel: string,
) => {
  const insights: { title: string; description: string; priority: string }[] = [];

  if (
    typeof signals.systolicBp === "number" &&
    typeof signals.diastolicBp === "number"
  ) {
    if (signals.systolicBp >= 140 || signals.diastolicBp >= 90) {
      insights.push({
        title: "Blood pressure elevated",
        description:
          "Recent blood pressure readings are elevated. Consider monitoring and discussing with a clinician.",
        priority: "High",
      });
    } else if (signals.systolicBp >= 130 || signals.diastolicBp >= 80) {
      insights.push({
        title: "Blood pressure trending up",
        description:
          "Blood pressure is slightly elevated. Track trends and lifestyle factors.",
        priority: "Medium",
      });
    }
  }

  if (typeof signals.glucoseLevel === "number") {
    if (signals.glucoseLevel >= 126) {
      insights.push({
        title: "Glucose elevated",
        description:
          "Glucose values are above typical range. Consider follow-up testing and clinician review.",
        priority: "High",
      });
    } else if (signals.glucoseLevel >= 100) {
      insights.push({
        title: "Glucose borderline",
        description:
          "Glucose is on the higher side. Monitor diet, activity, and trends.",
        priority: "Medium",
      });
    }
  }

  if (typeof signals.bmi === "number") {
    if (signals.bmi >= 30) {
      insights.push({
        title: "BMI indicates obesity",
        description:
          "BMI is in the obesity range. A gradual, clinician-guided plan may help reduce risk.",
        priority: "Medium",
      });
    } else if (signals.bmi >= 25) {
      insights.push({
        title: "BMI indicates overweight",
        description:
          "BMI is above the typical range. Nutrition and activity improvements may help.",
        priority: "Low",
      });
    } else if (signals.bmi < 18.5) {
      insights.push({
        title: "BMI indicates underweight",
        description:
          "BMI is below the typical range. Consider discussing nutrition goals with a clinician.",
        priority: "Low",
      });
    }
  }

  if (signals.symptomCount && signals.symptomCount >= 3) {
    insights.push({
      title: "Multiple symptoms reported",
      description:
        "Several symptoms are present. Track changes and consult if they persist.",
      priority: "Medium",
    });
  }

  if (!insights.length) {
    insights.push({
      title: "No major risk signals",
      description:
        "Recent data does not show major risk signals. Continue regular monitoring.",
      priority: "Info",
    });
  }

  if (riskLevel === "High") {
    insights.unshift({
      title: "High risk level",
      description:
        "Overall risk score is high. Consider scheduling a clinical review soon.",
      priority: "High",
    });
  }

  return insights;
};

const inferConditionFromSignals = (signals: RiskSignals) => {
  if (
    typeof signals.systolicBp === "number" &&
    typeof signals.diastolicBp === "number" &&
    (signals.systolicBp >= 140 || signals.diastolicBp >= 90)
  ) {
    return "Possible hypertension risk";
  }
  if (typeof signals.glucoseLevel === "number" && signals.glucoseLevel >= 126) {
    return "Possible elevated glucose risk";
  }
  if (typeof signals.bmi === "number" && signals.bmi >= 30) {
    return "Weight-related risk";
  }
  return "General wellness";
};

const buildMedicationConditions = (medications?: MedicationsDb | null) => {
  if (!medications) return [];
  const values = [medications.diagnosis, medications.disease, medications.purpose]
    .filter(Boolean)
    .map((value) => String(value));
  return values.length ? values : [];
};

const pickVitals = (
  vitalsList: VitalsDb[],
  userData?: UserDataDb | null,
) => {
  const sortedVitals = sortByLatestDateDesc(vitalsList, ["recordedAt", "createdAt"]);
  const latest = sortedVitals[0];

  if (!latest && userData?.latestVitals) {
    return {
      systolicBp: userData.latestVitals.systolicBp,
      diastolicBp: userData.latestVitals.diastolicBp,
      glucoseLevel: userData.latestVitals.glucoseLevel,
      heartRate: userData.latestVitals.heartRate,
      weight: userData.latestVitals.weight ?? userData.weightKg,
      height: userData.latestVitals.height ?? userData.heightCm,
      bmi: userData.latestVitals.bmi,
      recordedAt: userData.latestVitals.recordedAt,
    };
  }

  if (!latest) return undefined;

  const pickLatestNumber = (field: keyof VitalsDb) => {
    for (const vital of sortedVitals) {
      const value = vital[field];
      if (typeof value === "number") return value;
    }
    return undefined;
  };

  const createdAt = (latest as { createdAt?: Date }).createdAt;

  return {
    systolicBp: pickLatestNumber("systolicBp"),
    diastolicBp: pickLatestNumber("diastolicBp"),
    glucoseLevel: pickLatestNumber("glucoseLevel"),
    heartRate: pickLatestNumber("heartRate"),
    weight: pickLatestNumber("weight") ?? userData?.weightKg,
    height: pickLatestNumber("height") ?? userData?.heightCm,
    bmi: pickLatestNumber("bmi"),
    recordedAt: latest.recordedAt ?? createdAt,
  };
};

const pickSymptoms = (symptomsList: SymptomsDb[]) => {
  const sortedSymptoms = sortByLatestDateDesc(symptomsList, ["loggedAt", "createdAt"]);
  const latest = sortedSymptoms[0];
  if (!latest) return undefined;
  const createdAt = (latest as { createdAt?: Date }).createdAt;

  const pickLatestValue = <T,>(
    selector: (item: SymptomsDb) => T | undefined,
  ) => {
    for (const symptom of sortedSymptoms) {
      const value = selector(symptom);
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
  };

  const latestSymptomList =
    pickLatestValue((item) =>
      Array.isArray(item.symptomList) && item.symptomList.length
        ? item.symptomList
        : undefined,
    ) ?? [];

  return {
    symptomList: latestSymptomList,
    severity: pickLatestValue((item) => item.severity),
    durationDays: pickLatestValue((item) => item.durationDays),
    loggedAt: latest.loggedAt ?? createdAt,
  };
};

const pickLabTest = (labTest?: LabTestDb | null) => {
  if (!labTest) return undefined;
  const createdAt = (labTest as { createdAt?: Date }).createdAt;
  return {
    testName: labTest.testName,
    resultValue: labTest.resultValue,
    unit: labTest.unit,
    testedDate: labTest.testedDate ?? createdAt,
  };
};

export class RiskAssessmentService {
  async generateAssessment(userId: string, payload: GenerateRiskAssessmentPayload) {
    const { vitalsIds, symptomsIds, maxInsights, notes, includeAi, reportId } =
      payload;
    const shouldUseLatest = payload.useLatest ?? true;
    const forceRefresh =
      payload.force === true ||
      !shouldUseLatest ||
      Boolean(notes) ||
      Boolean(reportId) ||
      Boolean(vitalsIds?.length) ||
      Boolean(symptomsIds?.length);

    const [userData, latestLabTest, latestMedication, latestAssessment] =
      await Promise.all([
        userDataRepository.getByUserId(userId),
        labTestRepository.getLatestForUser(userId),
        medicationsRepository.getLatestForUser(userId),
        riskAssessmentRepository.getLatestForUser(userId),
      ]);

    const vitalsList = vitalsIds?.length
      ? (
          await Promise.all(
            vitalsIds.map((id) => vitalsRepository.getForUser(id, userId)),
          )
        ).filter((item): item is VitalsDb => Boolean(item))
      : shouldUseLatest
        ? await vitalsRepository.getRecentForUser(
            userId,
            Number(process.env.RISK_RECENT_VITALS_LIMIT ?? DEFAULT_RECENT_VITALS_LIMIT),
          )
        : [];

    const symptomsList = symptomsIds?.length
      ? (
          await Promise.all(
            symptomsIds.map((id) => symptomsRepository.getForUser(id, userId)),
          )
        ).filter((item): item is SymptomsDb => Boolean(item))
      : shouldUseLatest
        ? await symptomsRepository.getRecentForUser(
            userId,
            Number(process.env.RISK_RECENT_SYMPTOMS_LIMIT ?? DEFAULT_RECENT_SYMPTOMS_LIMIT),
          )
        : [];

      const vitalsSnapshot = pickVitals(vitalsList, userData);
      const symptomsSnapshot = pickSymptoms(symptomsList);
      const labSnapshot = pickLabTest(latestLabTest);

      const latestVital = selectMostRecent(vitalsList, [
        "recordedAt",
        "createdAt",
      ]);
      const latestSymptom = selectMostRecent(symptomsList, [
        "loggedAt",
        "createdAt",
      ]);
      const latestDataAt = maxDate([
        pickLatestDate(latestVital, ["recordedAt", "createdAt"]),
        pickLatestDate(latestSymptom, ["loggedAt", "createdAt"]),
        pickLatestDate(latestLabTest as Record<string, unknown>, [
          "testedDate",
          "createdAt",
        ]),
        pickLatestDate(latestMedication as Record<string, unknown>, [
          "startDate",
          "createdAt",
        ]),
        pickLatestDate(userData as Record<string, unknown>, [
          "updatedAt",
          "createdAt",
        ]),
      ]);

    if (!forceRefresh && latestAssessment) {
      const assessmentDate = pickLatestDate(
        latestAssessment as Record<string, unknown>,
        ["assessmentDate", "createdAt"],
      );
      const cooldownHours = Number(
        process.env.RISK_ASSESSMENT_AI_COOLDOWN_HOURS ??
          DEFAULT_RISK_COOLDOWN_HOURS,
      );
      const cooldownMs = Math.max(1, cooldownHours) * 60 * 60 * 1000;
      const isFresh =
        assessmentDate &&
        Date.now() - assessmentDate.getTime() < cooldownMs;
      const dataUnchanged =
        !latestDataAt ||
        (assessmentDate && latestDataAt.getTime() <= assessmentDate.getTime());

      if (dataUnchanged) {
        const historyHours = Number(
          process.env.RISK_ASSESSMENT_HISTORY_HOURS ??
            DEFAULT_RISK_HISTORY_HOURS,
        );
        const historyMs = Math.max(1, historyHours) * 60 * 60 * 1000;
        const isHistoryDue =
          !assessmentDate ||
          Date.now() - assessmentDate.getTime() >= historyMs;

        if (!isHistoryDue) {
          const insights = await healthInsightRepository.getAllForUser(
            userId,
            String(latestAssessment._id),
          );
          return {
            assessment: latestAssessment,
            insights,
          };
        }

        const clonedAssessment = await riskAssessmentRepository.create({
          userId,
          predictedCondition: latestAssessment.predictedCondition,
          riskLevel: latestAssessment.riskLevel,
          confidenceScore: latestAssessment.confidenceScore,
          riskScore: latestAssessment.riskScore,
          vaidyaScore: latestAssessment.vaidyaScore,
          assessmentDate: new Date(),
        });

        if (vitalsList.length) {
          await riskVitalsRepository.createMany(
            vitalsList.map((vitals) => ({
              riskId: clonedAssessment._id!,
              vitalsId: vitals._id!,
            })),
          );
        }

        if (symptomsList.length) {
          await riskSymptomsRepository.createMany(
            symptomsList.map((symptoms) => ({
              riskId: clonedAssessment._id!,
              symptomsId: symptoms._id!,
            })),
          );
        }

        const existingInsights = await healthInsightRepository.getAllForUser(
          userId,
          String(latestAssessment._id),
        );
        const clonedInsightsPayload = existingInsights.map((insight) => ({
          userId,
          insightTitle: insight.insightTitle,
          description: insight.description,
          priority: normalizePriority(insight.priority),
          generatedFromRisk: String(clonedAssessment._id),
        }));
        const clonedInsights = clonedInsightsPayload.length
          ? await healthInsightRepository.createMany(clonedInsightsPayload)
          : [];

        return {
          assessment: clonedAssessment,
          insights: clonedInsights,
        };
      }

    }

    const age = computeAge(userData?.dob);
    const bmi =
      vitalsSnapshot?.bmi ??
      computeBmi(vitalsSnapshot?.weight, vitalsSnapshot?.height);

    const signals: RiskSignals = {
      age,
      gender: userData?.gender,
      bmi,
      systolicBp: vitalsSnapshot?.systolicBp,
      diastolicBp: vitalsSnapshot?.diastolicBp,
      glucoseLevel: vitalsSnapshot?.glucoseLevel,
      heartRate: vitalsSnapshot?.heartRate,
      symptomCount: symptomsSnapshot
        ? symptomsSnapshot.symptomList?.length ?? 0
        : undefined,
      symptomSeverity: symptomsSnapshot?.severity,
      symptomDurationDays: symptomsSnapshot?.durationDays,
      labTestName: labSnapshot?.testName,
      labResultValue: labSnapshot?.resultValue,
      labUnit: labSnapshot?.unit,
      medicationConditions: buildMedicationConditions(latestMedication),
    };

    const latestDates: Date[] = [];
    if (vitalsSnapshot?.recordedAt) {
      const date = toDate(vitalsSnapshot.recordedAt);
      if (date) latestDates.push(date);
    }
    if (symptomsSnapshot?.loggedAt) {
      const date = toDate(symptomsSnapshot.loggedAt);
      if (date) latestDates.push(date);
    }
    if (labSnapshot?.testedDate) {
      const date = toDate(labSnapshot.testedDate);
      if (date) latestDates.push(date);
    }

    const riskResult = computeRiskScore(signals);
    const riskScore = riskResult.score;
    const riskLevel = buildRiskLevel(riskScore);
    const vaidyaScore = computeVaidyaScore(riskScore, signals);
    const confidenceScore = computeConfidence(signals, latestDates);

    const insightLimit = clamp(maxInsights ?? 4, 1, 8);
    const prompt = buildRiskPrompt({
      riskScore,
      riskLevel,
      vaidyaScore,
      confidenceScore,
      factors: riskResult.factors,
      signals,
      notes,
      maxInsights: insightLimit,
    });

    const shouldUseAi = includeAi ?? true;
    const aiResponse = shouldUseAi ? await generateAiInsights(prompt) : null;
    const aiInsights = Array.isArray(aiResponse?.insights)
      ? aiResponse?.insights ?? []
      : [];

    const predictedCondition =
      aiResponse?.predicted_condition?.trim() ||
      inferConditionFromSignals(signals);

    const riskAssessment = await riskAssessmentRepository.create({
      userId,
      predictedCondition,
      riskLevel,
      confidenceScore,
      riskScore,
      vaidyaScore,
      assessmentDate: new Date(),
    });

    const riskId = String(riskAssessment._id);
    if (vitalsList.length) {
      await riskVitalsRepository.createMany(
        vitalsList.map((vitals) => ({
          riskId: riskAssessment._id!,
          vitalsId: vitals._id!,
        })),
      );
    }

    if (symptomsList.length) {
      await riskSymptomsRepository.createMany(
        symptomsList.map((symptoms) => ({
          riskId: riskAssessment._id!,
          symptomsId: symptoms._id!,
        })),
      );
    }

    const fallbackInsights = buildRuleBasedInsights(signals, riskLevel);
    const insightsPayload = (aiInsights.length ? aiInsights : fallbackInsights)
      .slice(0, insightLimit)
      .map((insight) => ({
        userId,
        insightTitle:
          "insight_title" in insight ? insight.insight_title : insight.title,
        description: insight.description,
        priority: normalizePriority(insight.priority),
        generatedFromRisk: String(riskAssessment._id),
      }));

    const createdInsights = await healthInsightRepository.createMany(
      insightsPayload,
    );

    if (
      reportId &&
      createdInsights.length &&
      mongoose.Types.ObjectId.isValid(reportId)
    ) {
      const reportObjectId = new mongoose.Types.ObjectId(reportId);
      await reportInsightRepository.createMany(
        createdInsights.map((insight) => ({
          reportId: reportObjectId,
          insightId: insight._id!,
        })),
      );
    }

    return {
      assessment: riskAssessment,
      insights: createdInsights,
      sources: {
        vitalsIds: vitalsList.map((vitals) => String(vitals._id)),
        symptomsIds: symptomsList.map((symptoms) => String(symptoms._id)),
        labTestId: latestLabTest?._id ? String(latestLabTest._id) : undefined,
        medicationId: latestMedication?._id
          ? String(latestMedication._id)
          : undefined,
      },
      signals,
    };
  }

  async getAssessments(userId: string) {
    return riskAssessmentRepository.getAllForUser(userId);
  }

  async getAssessmentById(userId: string, riskId: string) {
    const assessment = await riskAssessmentRepository.getForUser(riskId, userId);
    if (!assessment) throw new ApiError(404, "Risk assessment not found");

    const [riskVitals, riskSymptoms, insights] = await Promise.all([
      riskVitalsRepository.getByRisk(riskId),
      riskSymptomsRepository.getByRisk(riskId),
      healthInsightRepository.getAllForUser(userId, riskId),
    ]);

    return {
      assessment,
      insights,
      sources: {
        vitalsIds: riskVitals.map((item) => String(item.vitalsId)),
        symptomsIds: riskSymptoms.map((item) => String(item.symptomsId)),
      },
    };
  }
}
