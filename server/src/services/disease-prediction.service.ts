import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import * as ort from "onnxruntime-node";
import sharp from "sharp";
import { logger } from "../lib/logger";
import { AllergyRepository } from "../repositories/allergy.repository";
import { HealthInsightRepository } from "../repositories/health-insight.repository";
import { MedicationsRepository } from "../repositories/medications.repository";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { SymptomsRepository } from "../repositories/symptoms.repository";
import { VitalsRepository } from "../repositories/vitals.repository";

type PredictionItem = {
  disease: string;
  probability: number;
};

export type PredictionResponse = {
  top10: PredictionItem[];
  finalTop3: PredictionItem[];
  analysisSummary: string;
};

type HeartDiseaseInsight = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | "Info";
};

type HeartDiseasePredictionResult = {
  prediction: number;
  probability: number;
  riskLevel: "Low" | "Moderate" | "High";
  probabilities: { label: number; probability: number }[];
  insights: HeartDiseaseInsight[];
};

export type HeartDiseaseInput = {
  gender: string | number;
  smoking_history: string | number;
  age: number | string;
  bmi: number | string;
  HbA1c_level: number | string;
  blood_glucose_level: number | string;
  hypertension: number | string | boolean;
  heart_disease: number | string | boolean;
};

type DiabetesInsight = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | "Info";
};

type BrainTumorInsight = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | "Info";
};

type TuberculosisInsight = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | "Info";
};

type DiabetesPredictionResult = {
  prediction: number;
  probability: number;
  riskLevel: "Low" | "Moderate" | "High";
  probabilities: { label: number; probability: number }[];
  insights: DiabetesInsight[];
};

export type BrainTumorPredictionResult = {
  prediction: string;
  probability: number;
  probabilities: { label: string; probability: number }[];
  insights: BrainTumorInsight[];
};

export type TuberculosisPredictionResult = {
  prediction: string;
  probability: number;
  probabilities: { label: string; probability: number }[];
  riskLevel: "Low" | "Moderate" | "High";
  insights: TuberculosisInsight[];
};

export type DiabetesInput = {
  Pregnancies: number | string;
  Glucose: number | string;
  BloodPressure: number | string;
  SkinThickness: number | string;
  Insulin: number | string;
  BMI: number | string;
  DiabetesPedigreeFunction: number | string;
  Age: number | string;
};

const DEFAULT_MODEL_DIR = path.resolve(
  process.cwd(),
  "src",
  "prediction_models/symptoms",
);
const DEFAULT_MODEL_FILES = {
  model: "disease_model.onnx",
  labels: "disease_labels.json",
  features: "feature_columns.json",
};

const HEART_DISEASE_MODEL_DIR = path.resolve(
  process.cwd(),
  "src",
  "prediction_models/heart_disease",
);
const HEART_DISEASE_MODEL_FILES = {
  model: "heart_model.onnx",
  labels: "label_classes.json",
  features: "feature_columns.json",
};

const DIABETES_MODEL_DIR = path.resolve(
  process.cwd(),
  "src",
  "prediction_models/diabetes_model",
);
const DIABETES_MODEL_FILES = {
  model: "diabetes_model.onnx",
  labels: "label_classes.json",
  features: "feature_columns.json",
};

const BRAIN_TUMOR_MODEL_DIR = path.resolve(
  process.cwd(),
  "src",
  "prediction_models/brain_models",
);
const BRAIN_TUMOR_MODEL_FILES = {
  model: "brain_tumor_model.onnx",
  labels: "class_labels.json",
};

const TUBERCULOSIS_MODEL_DIR = path.resolve(
  process.cwd(),
  "src",
  "prediction_models/tuberculosis",
);
const TUBERCULOSIS_MODEL_FILES = {
  model: "tuber_model.onnx",
};
const TUBERCULOSIS_LABEL_CLASSES = ["Normal", "TB"];

const symptomsRepository = new SymptomsRepository();
const vitalsRepository = new VitalsRepository();
const medicalRecordRepository = new MedicalRecordRepository();
const medicationsRepository = new MedicationsRepository();
const allergyRepository = new AllergyRepository();
const healthInsightRepository = new HealthInsightRepository();

const HEART_DISEASE_INSIGHT_CONTEXT = "heart_disease_prediction";
const DIABETES_INSIGHT_CONTEXT = "diabetes_prediction";
const BRAIN_TUMOR_INSIGHT_CONTEXT = "brain_tumor_prediction";
const TUBERCULOSIS_INSIGHT_CONTEXT = "tuberculosis_prediction";

const toPercent = (value: number, scale = 100) =>
  Math.round(value * scale * 100) / 100;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const buildContextHash = (input: string) =>
  crypto.createHash("sha256").update(input).digest("hex");

const normalizeSymptom = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const formatShortDate = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

const buildPatientContext = async (userId: string) => {
  const [latestVitals, recentSymptoms, medicalRecords, medications, allergies] =
    await Promise.all([
      vitalsRepository.getLatestForUser(userId),
      symptomsRepository.getRecentForUser(userId, 5),
      medicalRecordRepository.getAllForUser(userId, { page: 1, limit: 5 }),
      medicationsRepository.getAllForUser(userId),
      allergyRepository.getAllForUser(userId),
    ]);

  return {
    latestVitals: latestVitals
      ? {
          systolicBp: latestVitals.systolicBp ?? null,
          diastolicBp: latestVitals.diastolicBp ?? null,
          glucoseLevel: latestVitals.glucoseLevel ?? null,
          heartRate: latestVitals.heartRate ?? null,
          bmi: latestVitals.bmi ?? null,
          recordedAt: formatShortDate(
            latestVitals.recordedAt ??
              (latestVitals as { createdAt?: Date }).createdAt,
          ),
        }
      : null,
    recentSymptoms: recentSymptoms.map((symptom) => ({
      symptoms: symptom.symptomList ?? [],
      severity: symptom.severity ?? "Unknown",
      status: symptom.status ?? "unknown",
      loggedAt: formatShortDate(
        symptom.loggedAt ?? (symptom as { createdAt?: Date }).createdAt,
      ),
    })),
    recentDiagnoses: medicalRecords.data
      .map((record) => record.diagnosis)
      .filter(Boolean)
      .slice(0, 5),
    medications: medications
      .map((med) => med.medicineName)
      .filter(Boolean)
      .slice(0, 5),
    allergies: allergies
      .map((item) => item.allergen)
      .filter(Boolean)
      .slice(0, 5),
  };
};

const GENDER_CLASSES = ["Female", "Male"];
const SMOKING_CLASSES = [
  "No Info",
  "current",
  "ever",
  "former",
  "never",
  "not current",
];
const toKey = (value: string) => value.trim().toLowerCase();
const buildLabelMap = (labels: string[]) =>
  new Map(labels.map((label, index) => [toKey(label), index]));
const genderMap = buildLabelMap(GENDER_CLASSES);
const smokingMap = buildLabelMap(SMOKING_CLASSES);

const parseNumeric = (value: unknown, field: string) => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for ${field}`);
  }
  return parsed;
};

const parseBinary = (value: unknown, field: string) => {
  if (typeof value === "boolean") return value ? 1 : 0;
  const parsed = parseNumeric(value, field);
  if (parsed !== 0 && parsed !== 1) {
    throw new Error(`Invalid binary value for ${field}`);
  }
  return parsed;
};

const encodeGender = (value: string | number) => {
  if (typeof value === "number") {
    if (value === 0 || value === 1) return value;
    throw new Error("Gender must be 0 or 1");
  }
  const encoded = genderMap.get(toKey(value));
  if (encoded === undefined) {
    throw new Error("Gender must be Female or Male");
  }
  return encoded;
};

const encodeSmoking = (value: string | number) => {
  if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 0 && value < smokingMap.size) {
      return value;
    }
    throw new Error("Smoking history is out of range");
  }
  const encoded = smokingMap.get(toKey(value));
  if (encoded === undefined) {
    throw new Error(
      "Smoking history must be one of: No Info, current, ever, former, never, not current",
    );
  }
  return encoded;
};

const softmax = (values: number[]) => {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0) || 1;
  return exps.map((value) => value / sum);
};

const sigmoid = (value: number) => 1 / (1 + Math.exp(-value));

type PatientContext = Awaited<ReturnType<typeof buildPatientContext>>;

type HeartDiseaseAdjustment = {
  title: string;
  detail: string;
  delta: number;
};

const toGenderLabel = (encoded: number) => GENDER_CLASSES[encoded] ?? "Unknown";
const toSmokingLabel = (encoded: number) =>
  SMOKING_CLASSES[encoded] ?? "Unknown";

const normalizeText = (value: string) => value.toLowerCase().trim();

const includesAny = (value: string, terms: string[]) => {
  const normalized = normalizeText(value);
  return terms.some((term) => normalized.includes(term));
};

const getRiskLevel = (probability: number) =>
  probability >= 0.7 ? "High" : probability >= 0.4 ? "Moderate" : "Low";

const getConfidenceLevel = (probabilityPercent: number) =>
  probabilityPercent >= 85 ? "High" : probabilityPercent >= 60 ? "Medium" : "Low";

const normalizeLabel = (value: string) =>
  value.toLowerCase().replace(/\s+/g, "").trim();

const buildBrainTumorInsights = (params: {
  predictionLabel: string;
  probabilityPercent: number;
}) => {
  const { predictionLabel, probabilityPercent } = params;
  const normalized = normalizeLabel(predictionLabel);
  const isNonTumor =
    normalized.includes("non-tumor") || normalized.includes("nontumor");
  const isTumor = normalized.includes("tumor") && !isNonTumor;
  const confidence = getConfidenceLevel(probabilityPercent);

  const insights: BrainTumorInsight[] = [];

  if (isTumor) {
    insights.push({
      title: "Potential tumor detected",
      description: `Model predicts Tumor with ${probabilityPercent}%. This is not a diagnosis; use this result as a screening signal only.`,
      priority: probabilityPercent >= 70 ? "High" : "Medium",
    });
  } else {
    insights.push({
      title: "No tumor detected",
      description: `Model predicts Non-Tumor with ${probabilityPercent}%. This does not rule out disease if symptoms persist.`,
      priority: "Info",
    });
  }

  insights.push({
    title: `Prediction confidence: ${confidence}`,
    description:
      confidence === "Low"
        ? "Low confidence can happen with low-quality or non-representative images. Try a clearer MRI slice if possible."
        : "Higher confidence indicates the model is more certain about this image.",
    priority: confidence === "Low" ? "Medium" : "Info",
  });

  insights.push({
    title: "Recommended follow-up",
    description:
      "If you have concerning symptoms, consult a qualified clinician and consider full radiology review.",
    priority: isTumor ? "High" : "Info",
  });

  return insights;
};

const buildTuberculosisInsights = (params: {
  predictionLabel: string;
  probabilityPercent: number;
  tbProbability: number;
}) => {
  const { predictionLabel, probabilityPercent, tbProbability } = params;
  const normalized = normalizeLabel(predictionLabel);
  const isTb = normalized.includes("tb") || normalized.includes("tuberculosis");
  const confidence = getConfidenceLevel(probabilityPercent);
  const riskLevel = getRiskLevel(tbProbability);

  const insights: TuberculosisInsight[] = [];

  if (isTb) {
    insights.push({
      title: "Potential TB pattern detected",
      description: `Model predicts TB with ${probabilityPercent}%. This is a screening result and not a clinical diagnosis.`,
      priority: probabilityPercent >= 70 ? "High" : "Medium",
    });
  } else {
    insights.push({
      title: "No TB pattern detected",
      description: `Model predicts Normal with ${probabilityPercent}%. This does not fully exclude disease.`,
      priority: "Info",
    });
  }

  insights.push({
    title: `TB risk level: ${riskLevel}`,
    description:
      riskLevel === "High"
        ? "Higher predicted TB probability. Prompt clinical review is recommended."
        : riskLevel === "Moderate"
          ? "Moderate predicted TB probability. Correlate with symptoms and clinician advice."
          : "Lower predicted TB probability. Continue routine monitoring if symptoms persist.",
    priority: riskLevel === "High" ? "High" : riskLevel === "Moderate" ? "Medium" : "Info",
  });

  insights.push({
    title: `Prediction confidence: ${confidence}`,
    description:
      confidence === "Low"
        ? "Low confidence may be caused by image quality or out-of-distribution inputs."
        : "Higher confidence means the model was more certain for this image.",
    priority: confidence === "Low" ? "Medium" : "Info",
  });

  insights.push({
    title: "Recommended follow-up",
    description:
      "If respiratory symptoms or clinical concern exist, consult a clinician and confirm with formal tests.",
    priority: isTb ? "High" : "Info",
  });

  return insights;
};

const buildHeartDiseaseAdjustments = (
  values: Record<string, number>,
  patientContext: PatientContext | null,
) => {
  const adjustments: HeartDiseaseAdjustment[] = [];
  const add = (delta: number, title: string, detail: string) => {
    adjustments.push({ delta, title, detail });
  };

  const hba1c = values.HbA1c_level;
  if (hba1c >= 6.5) {
    add(
      0.06,
      "HbA1c elevated",
      "Elevated HbA1c can increase cardiovascular risk.",
    );
  } else if (hba1c >= 5.7) {
    add(
      0.03,
      "HbA1c above normal",
      "Prediabetes range can add cardiovascular strain.",
    );
  } else {
    add(-0.02, "HbA1c in target range", "HbA1c is within the normal range.");
  }

  const glucose = values.blood_glucose_level;
  if (glucose >= 200) {
    add(0.05, "Glucose very high", "Elevated glucose can impact heart health.");
  } else if (glucose >= 126) {
    add(0.03, "Glucose high", "Higher glucose can increase risk.");
  } else if (glucose < 100) {
    add(-0.02, "Glucose controlled", "Glucose is in a healthy range.");
  }

  const bmi = values.bmi;
  if (bmi >= 35) {
    add(0.08, "BMI elevated", "BMI indicates higher metabolic risk.");
  } else if (bmi >= 30) {
    add(0.05, "BMI above 30", "BMI is in the obese range.");
  } else if (bmi < 23) {
    add(-0.03, "BMI in healthy range", "BMI is within a healthy range.");
  }

  if (values.age >= 45) {
    add(0.02, "Age factor", "Risk increases gradually after age 45.");
  }

  if (values.hypertension === 1) {
    add(
      0.08,
      "Hypertension present",
      "High blood pressure is a major risk driver.",
    );
  }

  if (values.heart_disease === 1) {
    add(
      0.1,
      "Cardiac history",
      "History of heart disease increases recurrence risk.",
    );
  }

  const smokingLabel = toSmokingLabel(values.smoking_history).toLowerCase();
  if (smokingLabel === "current") {
    add(
      0.02,
      "Smoking history",
      "Current smoking can impact metabolic health.",
    );
  } else if (smokingLabel === "former" || smokingLabel === "ever") {
    add(0.01, "Smoking history", "Past smoking can elevate long-term risk.");
  } else if (smokingLabel === "never") {
    add(-0.01, "Smoking history", "No smoking history supports lower risk.");
  }

  const latestVitals = patientContext?.latestVitals;
  const latestGlucose = latestVitals?.glucoseLevel;
  if (typeof latestGlucose === "number" && latestGlucose >= 126) {
    add(
      0.03,
      "Recent glucose trend",
      "Latest vitals show elevated glucose readings.",
    );
  } else if (typeof latestGlucose === "number" && latestGlucose < 100) {
    add(
      -0.01,
      "Recent glucose stable",
      "Latest vitals show stable glucose readings.",
    );
  }

  const latestBmi = latestVitals?.bmi;
  if (typeof latestBmi === "number" && latestBmi >= 30) {
    add(
      0.04,
      "Recent BMI trend",
      "Latest vitals show BMI in a higher risk range.",
    );
  }

  const systolic = latestVitals?.systolicBp;
  if (typeof systolic === "number") {
    if (systolic >= 140) {
      add(0.06, "Systolic BP high", "Recent systolic BP is >= 140 mmHg.");
    } else if (systolic >= 130) {
      add(0.04, "Systolic BP elevated", "Recent systolic BP is >= 130 mmHg.");
    } else if (systolic < 120) {
      add(
        -0.01,
        "Systolic BP stable",
        "Recent systolic BP is in a healthy range.",
      );
    }
  }

  const diastolic = latestVitals?.diastolicBp;
  if (typeof diastolic === "number" && diastolic >= 90) {
    add(0.03, "Diastolic BP high", "Recent diastolic BP is >= 90 mmHg.");
  }

  const diagnoses = patientContext?.recentDiagnoses ?? [];
  const diagnosisText = diagnoses.join(" ");
  if (
    diagnosisText &&
    includesAny(diagnosisText, ["heart", "cardio", "hypertension"])
  ) {
    add(
      0.08,
      "Cardiovascular diagnosis noted",
      "Recent records mention heart or blood pressure concerns.",
    );
  }

  const medications = patientContext?.medications ?? [];
  const medicationText = medications.join(" ");
  if (
    medicationText &&
    includesAny(medicationText, [
      "statin",
      "atorvastatin",
      "rosuvastatin",
      "beta",
      "ace",
      "aspirin",
    ])
  ) {
    add(
      0.05,
      "Medication signal",
      "Current medication list includes cardiovascular therapies.",
    );
  }

  return adjustments;
};

const applyHeartDiseaseAdjustments = (
  baseProbability: number,
  adjustments: HeartDiseaseAdjustment[],
) => {
  const delta = adjustments.reduce((total, item) => total + item.delta, 0);
  const cappedDelta = clamp(delta, -0.2, 0.2);
  return clamp(baseProbability + cappedDelta, 0.01, 0.99);
};

const buildHeartDiseaseInsights = (params: {
  probability: number;
  riskLevel: "Low" | "Moderate" | "High";
  adjustments: HeartDiseaseAdjustment[];
  values: Record<string, number>;
  geminiSummary?: string;
}) => {
  const { probability, riskLevel, adjustments, values, geminiSummary } = params;
  const percent = Math.round(probability * 1000) / 10;
  const positives = adjustments
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);
  const negatives = adjustments
    .filter((item) => item.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 2);

  const insights: HeartDiseaseInsight[] = [
    {
      title: `Overall heart disease risk: ${riskLevel}`,
      description: `Model probability is ${percent}%. This estimate blends your current inputs with recent health history.`,
      priority:
        riskLevel === "High"
          ? "High"
          : riskLevel === "Moderate"
            ? "Medium"
            : "Info",
    },
  ];

  if (geminiSummary) {
    insights.unshift({
      title: "History comparison",
      description: geminiSummary,
      priority: "Info",
    });
  }

  if (positives.length) {
    insights.push({
      title: "Key risk drivers",
      description: positives.map((item) => item.detail).join(" "),
      priority: riskLevel === "High" ? "High" : "Medium",
    });
  }

  if (negatives.length) {
    insights.push({
      title: "Protective factors",
      description: negatives.map((item) => item.detail).join(" "),
      priority: "Info",
    });
  }

  const smokingLabel = toSmokingLabel(values.smoking_history);
  insights.push({
    title: "Lifestyle focus",
    description:
      riskLevel === "High"
        ? "Prioritize heart-friendly meals, daily movement, and consistent sleep to reduce strain."
        : "Maintain a balanced routine with regular activity and steady meals to keep cardiovascular health stable.",
    priority: riskLevel === "High" ? "High" : "Info",
  });

  insights.push({
    title: "Monitoring recommendations",
    description:
      riskLevel === "High"
        ? "Consider follow-up labs and blood pressure checks, and share results with your clinician."
        : "Recheck blood pressure and metabolic labs periodically to keep trends on track.",
    priority: "Info",
  });

  if (smokingLabel && smokingLabel !== "No Info") {
    insights.push({
      title: "Smoking history note",
      description:
        smokingLabel === "never"
          ? "Staying smoke-free supports long-term cardiovascular health."
          : "Reducing or stopping smoking supports heart health and circulation.",
      priority: "Info",
    });
  }

  return insights;
};

type DiabetesAdjustment = {
  title: string;
  detail: string;
  delta: number;
};

const buildDiabetesAdjustments = (
  values: Record<string, number>,
  patientContext: PatientContext | null,
) => {
  const adjustments: DiabetesAdjustment[] = [];
  const add = (delta: number, title: string, detail: string) => {
    adjustments.push({ delta, title, detail });
  };

  const glucose = values.Glucose;
  if (glucose >= 200) {
    add(0.1, "Glucose very high", "Recent glucose is >= 200 mg/dL.");
  } else if (glucose >= 126) {
    add(0.07, "Glucose high", "Recent glucose is >= 126 mg/dL.");
  } else if (glucose < 100) {
    add(-0.03, "Glucose controlled", "Glucose is in a healthy range.");
  }

  const bmi = values.BMI;
  if (bmi >= 35) {
    add(0.08, "BMI elevated", "BMI indicates higher metabolic risk.");
  } else if (bmi >= 30) {
    add(0.05, "BMI above 30", "BMI is in the obese range.");
  } else if (bmi < 23) {
    add(-0.03, "BMI in healthy range", "BMI is within a healthy range.");
  }

  if (values.Age >= 45) {
    add(0.02, "Age factor", "Risk increases gradually after age 45.");
  }

  const bp = values.BloodPressure;
  if (bp >= 140) {
    add(0.03, "Blood pressure high", "Blood pressure is >= 140 mmHg.");
  } else if (bp >= 130) {
    add(0.02, "Blood pressure elevated", "Blood pressure is >= 130 mmHg.");
  }

  const pregnancies = values.Pregnancies;
  if (pregnancies >= 4) {
    add(0.02, "Pregnancy history", "Higher pregnancy count can influence risk.");
  }

  const skinThickness = values.SkinThickness;
  if (skinThickness >= 35) {
    add(0.03, "Skin thickness elevated", "Higher skin thickness can indicate risk.");
  }

  const insulin = values.Insulin;
  if (insulin >= 200) {
    add(0.04, "Insulin elevated", "Higher insulin levels can indicate resistance.");
  }

  const dpf = values.DiabetesPedigreeFunction;
  if (dpf >= 1.2) {
    add(0.05, "Family history signal", "Diabetes pedigree is high.");
  } else if (dpf >= 0.8) {
    add(0.03, "Family history signal", "Diabetes pedigree is above average.");
  }

  const latestVitals = patientContext?.latestVitals;
  const latestGlucose = latestVitals?.glucoseLevel;
  if (typeof latestGlucose === "number" && latestGlucose >= 126) {
    add(
      0.04,
      "Recent glucose trend",
      "Latest vitals show elevated glucose readings.",
    );
  } else if (typeof latestGlucose === "number" && latestGlucose < 100) {
    add(
      -0.02,
      "Recent glucose stable",
      "Latest vitals show stable glucose readings.",
    );
  }

  const latestBmi = latestVitals?.bmi;
  if (typeof latestBmi === "number" && latestBmi >= 30) {
    add(
      0.03,
      "Recent BMI trend",
      "Latest vitals show BMI in a higher risk range.",
    );
  }

  const diagnoses = patientContext?.recentDiagnoses ?? [];
  const diagnosisText = diagnoses.join(" ");
  if (
    diagnosisText &&
    includesAny(diagnosisText, ["diabetes", "prediabetes"])
  ) {
    add(
      0.15,
      "Past diagnosis noted",
      "Recent records mention diabetes or prediabetes.",
    );
  }

  const medications = patientContext?.medications ?? [];
  const medicationText = medications.join(" ");
  if (medicationText && includesAny(medicationText, ["metformin", "insulin"])) {
    add(
      0.1,
      "Medication signal",
      "Current medication list includes diabetes treatments.",
    );
  }

  return adjustments;
};

const applyDiabetesAdjustments = (
  baseProbability: number,
  adjustments: DiabetesAdjustment[],
) => {
  const delta = adjustments.reduce((total, item) => total + item.delta, 0);
  const cappedDelta = clamp(delta, -0.2, 0.2);
  return clamp(baseProbability + cappedDelta, 0.01, 0.99);
};

const buildDiabetesInsights = (params: {
  probability: number;
  riskLevel: "Low" | "Moderate" | "High";
  adjustments: DiabetesAdjustment[];
  geminiSummary?: string;
}) => {
  const { probability, riskLevel, adjustments, geminiSummary } = params;
  const percent = Math.round(probability * 1000) / 10;
  const positives = adjustments
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);
  const negatives = adjustments
    .filter((item) => item.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 2);

  const insights: DiabetesInsight[] = [
    {
      title: `Overall diabetes risk: ${riskLevel}`,
      description: `Model probability is ${percent}%. This estimate blends your current inputs with recent health history.`,
      priority:
        riskLevel === "High"
          ? "High"
          : riskLevel === "Moderate"
            ? "Medium"
            : "Info",
    },
  ];

  if (geminiSummary) {
    insights.unshift({
      title: "History comparison",
      description: geminiSummary,
      priority: "Info",
    });
  }

  if (positives.length) {
    insights.push({
      title: "Key risk drivers",
      description: positives.map((item) => item.detail).join(" "),
      priority: riskLevel === "High" ? "High" : "Medium",
    });
  }

  if (negatives.length) {
    insights.push({
      title: "Protective factors",
      description: negatives.map((item) => item.detail).join(" "),
      priority: "Info",
    });
  }

  insights.push({
    title: "Lifestyle focus",
    description:
      riskLevel === "High"
        ? "Prioritize balanced meals, daily movement, and consistent sleep to support glucose control."
        : "Maintain a balanced routine with regular activity and steady meals to keep glucose stable.",
    priority: riskLevel === "High" ? "High" : "Info",
  });

  insights.push({
    title: "Monitoring recommendations",
    description:
      riskLevel === "High"
        ? "Consider follow-up labs (fasting glucose, HbA1c) and share results with your clinician."
        : "Recheck glucose and HbA1c periodically to keep trends on track.",
    priority: "Info",
  });

  return insights;
};

const buildGeminiPrompt = (params: {
  top10: PredictionItem[];
  patientContext: Record<string, unknown>;
}) => `
You are a clinical decision support assistant.
You will receive the model's top 10 predictions with probabilities and the patient's recent history.
Adjust probabilities slightly (small increases/decreases) based on context.
Do not invent new diseases. Keep output within the top 10 diseases.
Return JSON only:
{
  "analysisSummary": "string",
  "finalTop3": [
    { "disease": "string", "probability": number }
  ]
}
Rules:
- finalTop3 must have exactly 3 items.
- Probabilities must be between 0 and 100.
- Keep probabilities close to the original top10 (only small adjustments).
Top 10 predictions:
${JSON.stringify(params.top10)}
Patient context:
${JSON.stringify(params.patientContext)}
`;

const buildHeartDiseaseGeminiPrompt = (params: {
  probability: number;
  inputProfile: Record<string, number>;
  patientContext: Record<string, unknown>;
}) => `
You are a clinical decision support assistant.
You will receive a heart disease model probability (0-100) and the patient's recent history.
Adjust the probability slightly based on context. Do not invent new data.
Return JSON only:
{
  "adjusted_probability": number,
  "summary": "string"
}
Rules:
- adjusted_probability must be between 0 and 100.
- Adjustment must be small (within +/-10 of the model probability).
- Summary should be 1-2 sentences referencing only the provided context.
Model probability:
${params.probability}
Input profile:
${JSON.stringify(params.inputProfile)}
Patient context:
${JSON.stringify(params.patientContext)}
`;

const buildDiabetesGeminiPrompt = (params: {
  probability: number;
  inputProfile: Record<string, number>;
  patientContext: Record<string, unknown>;
}) => `
You are a clinical decision support assistant.
You will receive a diabetes model probability (0-100) and the patient's recent history.
Adjust the probability slightly based on context. Do not invent new data.
Return JSON only:
{
  "adjusted_probability": number,
  "summary": "string"
}
Rules:
- adjusted_probability must be between 0 and 100.
- Adjustment must be small (within +/-10 of the model probability).
- Summary should be 1-2 sentences referencing only the provided context.
Model probability:
${params.probability}
Input profile:
${JSON.stringify(params.inputProfile)}
Patient context:
${JSON.stringify(params.patientContext)}
`;

const callGemini = async (prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const endpoint =
    process.env.GEMINI_API_URL ??
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
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
};

const refineHeartDiseaseWithGemini = async (params: {
  probability: number;
  inputProfile: Record<string, number>;
  patientContext: Record<string, unknown>;
}) => {
  const prompt = buildHeartDiseaseGeminiPrompt(params);
  try {
    const text = await callGemini(prompt);
    const parsed = extractJson(text) as {
      adjusted_probability?: number;
      summary?: string;
    } | null;
    if (!parsed) return null;
    const base = params.probability;
    const adjustedRaw =
      typeof parsed.adjusted_probability === "number"
        ? parsed.adjusted_probability
        : Number(parsed.adjusted_probability);
    const summary =
      typeof parsed.summary === "string" ? parsed.summary.trim() : undefined;
    if (!Number.isFinite(adjustedRaw)) {
      return summary ? { summary } : null;
    }
    const bounded = clamp(adjustedRaw, 0, 100);
    const min = Math.max(0, base - 10);
    const max = Math.min(100, base + 10);
    return { adjustedProbability: clamp(bounded, min, max), summary };
  } catch (error) {
    logger.warn({ error }, "Gemini refinement failed for heart disease");
    return null;
  }
};

const refineDiabetesWithGemini = async (params: {
  probability: number;
  inputProfile: Record<string, number>;
  patientContext: Record<string, unknown>;
}) => {
  const prompt = buildDiabetesGeminiPrompt(params);
  try {
    const text = await callGemini(prompt);
    const parsed = extractJson(text) as {
      adjusted_probability?: number;
      summary?: string;
    } | null;
    if (!parsed) return null;
    const base = params.probability;
    const adjustedRaw =
      typeof parsed.adjusted_probability === "number"
        ? parsed.adjusted_probability
        : Number(parsed.adjusted_probability);
    const summary =
      typeof parsed.summary === "string" ? parsed.summary.trim() : undefined;
    if (!Number.isFinite(adjustedRaw)) {
      return summary ? { summary } : null;
    }
    const bounded = clamp(adjustedRaw, 0, 100);
    const min = Math.max(0, base - 10);
    const max = Math.min(100, base + 10);
    return { adjustedProbability: clamp(bounded, min, max), summary };
  } catch (error) {
    logger.warn({ error }, "Gemini refinement failed for diabetes");
    return null;
  }
};

export class DiseasePredictionService {
  private session: ort.InferenceSession | null = null;
  private featureColumns: string[] = [];
  private diseaseLabels: string[] = [];
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.loadModel();
    return this.initPromise;
  }

  private resolveModelDir() {
    const override = process.env.PREDICTION_MODEL_DIR;
    if (override) return path.resolve(override);
    const srcDir = DEFAULT_MODEL_DIR;
    const distDir = path.resolve(process.cwd(), "dist", "prediction_models");
    if (existsSync(srcDir)) return srcDir;
    if (existsSync(distDir)) return distDir;
    return srcDir;
  }

  private async loadJsonFile<T>(filePath: string): Promise<T> {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  }

  private async loadModel() {
    const modelDir = this.resolveModelDir();
    const modelPath = path.join(modelDir, DEFAULT_MODEL_FILES.model);
    const labelsPath = path.join(modelDir, DEFAULT_MODEL_FILES.labels);
    const featuresPath = path.join(modelDir, DEFAULT_MODEL_FILES.features);

    this.featureColumns = await this.loadJsonFile<string[]>(featuresPath);
    this.diseaseLabels = await this.loadJsonFile<string[]>(labelsPath);

    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
    });

    logger.info("Disease prediction model loaded");
  }

  private buildInputVector(symptoms: string[]) {
    const vector = new Float32Array(this.featureColumns.length);
    const normalizedSymptoms = symptoms
      .map((symptom) => normalizeSymptom(symptom))
      .filter(Boolean);

    normalizedSymptoms.forEach((symptom) => {
      const index = this.featureColumns.indexOf(symptom);
      if (index !== -1) {
        vector[index] = 1;
      }
    });

    return vector;
  }

  private async refineWithGemini(
    top10: PredictionItem[],
    patientContext: Record<string, unknown>,
  ) {
    const prompt = buildGeminiPrompt({ top10, patientContext });
    const text = await callGemini(prompt);
    const parsed = extractJson(text) as {
      analysisSummary?: string;
      finalTop3?: PredictionItem[];
    } | null;

    if (parsed?.finalTop3?.length === 3) {
      return {
        finalTop3: parsed.finalTop3.map((item) => ({
          disease: item.disease,
          probability: Math.max(0, Math.min(100, Number(item.probability))),
        })),
        analysisSummary:
          parsed.analysisSummary ??
          "Adjusted predictions based on patient history.",
      };
    }

    return {
      finalTop3: top10.slice(0, 3),
      analysisSummary:
        "Could not refine predictions. Showing top model results.",
    };
  }

  async predict(
    userId: string,
    symptoms: string[],
  ): Promise<PredictionResponse> {
    await this.init();
    if (!this.session) throw new Error("Prediction model not available");

    if (!Array.isArray(symptoms) || symptoms.length < 1) {
      throw new Error("At least 1 symptom is required");
    }

    const inputVector = this.buildInputVector(symptoms);
    if (!inputVector.some((value) => value === 1)) {
      throw new Error("No matching symptoms found in model features");
    }

    const inputName = this.session.inputNames[0];
    const tensor = new ort.Tensor("float32", inputVector, [
      1,
      inputVector.length,
    ]);

    const outputMap = await this.session.run({ [inputName]: tensor });
    const probabilityOutput = outputMap["probabilities"];
    const outputTensor =
      probabilityOutput &&
      typeof probabilityOutput === "object" &&
      "data" in probabilityOutput
        ? probabilityOutput
        : outputMap[Object.keys(outputMap)[0]];

    if (
      !outputTensor ||
      typeof outputTensor !== "object" ||
      !("data" in outputTensor)
    ) {
      throw new Error("Prediction output is not a tensor");
    }

    const scores = Array.from(
      (outputTensor as ort.Tensor).data as unknown as ArrayLike<number>,
    );

    if (scores.length !== this.diseaseLabels.length) {
      throw new Error("Prediction output size does not match disease labels");
    }

    const maxScore = scores.reduce(
      (max, value) => (value > max ? value : max),
      0,
    );
    const scale = maxScore > 1.5 ? 1 : 100;

    const predictions = this.diseaseLabels.map((label, index) => ({
      disease: label,
      probability: toPercent(scores[index] ?? 0, scale),
    }));

    const top10 = predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 10);

    const patientContext = await buildPatientContext(userId);
    const refined = await this.refineWithGemini(top10, patientContext);

    return {
      top10,
      finalTop3: refined.finalTop3,
      analysisSummary: refined.analysisSummary,
    };
  }
}

export const diseasePredictionService = new DiseasePredictionService();

export class HeartDiseasePredictionService {
  private session: ort.InferenceSession | null = null;
  private featureColumns: string[] = [];
  private labelClasses: number[] = [];
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.loadModel();
    return this.initPromise;
  }

  private resolveModelDir() {
    const override = process.env.HEART_DISEASE_MODEL_DIR;
    if (override) return path.resolve(override);
    const srcDir = HEART_DISEASE_MODEL_DIR;
    const distDir = path.resolve(
      process.cwd(),
      "dist",
      "prediction_models/heart_disease",
    );
    if (existsSync(srcDir)) return srcDir;
    if (existsSync(distDir)) return distDir;
    return srcDir;
  }

  private async loadJsonFile<T>(filePath: string): Promise<T> {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  }

  private async loadModel() {
    const modelDir = this.resolveModelDir();
    const modelCandidates = [
      path.join(modelDir, HEART_DISEASE_MODEL_FILES.model),
      path.join(modelDir, "diabetes_model.onnx"),
    ];
    const modelPath =
      modelCandidates.find((candidate) => existsSync(candidate)) ??
      modelCandidates[0];
    const labelsPath = path.join(modelDir, HEART_DISEASE_MODEL_FILES.labels);
    const featuresPath = path.join(
      modelDir,
      HEART_DISEASE_MODEL_FILES.features,
    );

    this.featureColumns = await this.loadJsonFile<string[]>(featuresPath);
    this.labelClasses = await this.loadJsonFile<number[]>(labelsPath);

    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
    });

    logger.info("Heart disease prediction model loaded");
  }

  private buildInputVector(input: HeartDiseaseInput) {
    const values: Record<string, number> = {
      gender: encodeGender(input.gender),
      smoking_history: encodeSmoking(input.smoking_history),
      age: parseNumeric(input.age, "age"),
      bmi: parseNumeric(input.bmi, "bmi"),
      HbA1c_level: parseNumeric(input.HbA1c_level, "HbA1c_level"),
      blood_glucose_level: parseNumeric(
        input.blood_glucose_level,
        "blood_glucose_level",
      ),
      hypertension: parseBinary(input.hypertension, "hypertension"),
      heart_disease: parseBinary(input.heart_disease, "heart_disease"),
    };

    const vector = new Float32Array(this.featureColumns.length);
    this.featureColumns.forEach((feature, index) => {
      const value = values[feature];
      if (typeof value !== "number") {
        throw new Error(`Missing required feature: ${feature}`);
      }
      vector[index] = value;
    });
    return { vector, values };
  }

  async predict(
    userId: string,
    input: HeartDiseaseInput,
  ): Promise<HeartDiseasePredictionResult> {
    await this.init();
    if (!this.session) throw new Error("Prediction model not available");

    const { vector: inputVector, values } = this.buildInputVector(input);
    const inputName = this.session.inputNames[0];
    const tensor = new ort.Tensor("float32", inputVector, [
      1,
      inputVector.length,
    ]);

    const outputMap = await this.session.run({ [inputName]: tensor });
    const outputTensor =
      outputMap["probabilities"] ?? outputMap[Object.keys(outputMap)[0]];

    if (
      !outputTensor ||
      typeof outputTensor !== "object" ||
      !("data" in outputTensor)
    ) {
      throw new Error("Prediction output is not a tensor");
    }

    const scores = Array.from(
      (outputTensor as ort.Tensor).data as unknown as ArrayLike<number>,
    );

    let probabilities: number[] = [];
    if (scores.length === 1 && this.labelClasses.length === 2) {
      const raw = scores[0];
      const p = raw >= 0 && raw <= 1 ? raw : sigmoid(raw);
      probabilities = [1 - p, p];
    } else if (scores.length > 1) {
      const sum = scores.reduce((total, value) => total + value, 0);
      const in01 = scores.every((value) => value >= 0 && value <= 1);
      probabilities = in01 && sum <= 1.2 ? scores : softmax(scores);
    } else {
      probabilities = scores;
    }

    if (probabilities.length !== this.labelClasses.length) {
      throw new Error("Prediction output size does not match label classes");
    }

    const positiveIndex = this.labelClasses.indexOf(1);
    if (positiveIndex !== -1) {
      const patientContext = await buildPatientContext(userId);
      const adjustments = buildHeartDiseaseAdjustments(values, patientContext);
      let adjusted = applyHeartDiseaseAdjustments(
        probabilities[positiveIndex] ?? 0,
        adjustments,
      );

      const geminiRefinement = await refineHeartDiseaseWithGemini({
        probability: Math.round(adjusted * 1000) / 10,
        inputProfile: values,
        patientContext,
      });
      if (typeof geminiRefinement?.adjustedProbability === "number") {
        adjusted = clamp(
          geminiRefinement.adjustedProbability / 100,
          0.01,
          0.99,
        );
      }
      probabilities = [...probabilities];
      probabilities[positiveIndex] = adjusted;
      if (probabilities.length === 2) {
        const otherIndex = positiveIndex === 0 ? 1 : 0;
        probabilities[otherIndex] = clamp(1 - adjusted, 0.01, 0.99);
      } else {
        const sum =
          probabilities.reduce((total, value) => total + value, 0) || 1;
        probabilities = probabilities.map((value) => value / sum);
      }

      const riskLevel = getRiskLevel(adjusted);
      const insights = buildHeartDiseaseInsights({
        probability: adjusted,
        riskLevel,
        adjustments,
        values,
        geminiSummary: geminiRefinement?.summary,
      });

      const contextHash = buildContextHash(
        JSON.stringify({
          Pregnancies: values.Pregnancies,
          Glucose: values.Glucose,
          BloodPressure: values.BloodPressure,
          SkinThickness: values.SkinThickness,
          Insulin: values.Insulin,
          BMI: values.BMI,
          DiabetesPedigreeFunction: values.DiabetesPedigreeFunction,
          Age: values.Age,
          riskLevel,
        }),
      );

      try {
        await healthInsightRepository.deleteByContext(
          userId,
          HEART_DISEASE_INSIGHT_CONTEXT,
          contextHash,
        );
        await healthInsightRepository.createMany(
          insights.map((insight) => ({
            userId,
            insightTitle: insight.title,
            description: insight.description,
            priority: insight.priority,
            contextType: HEART_DISEASE_INSIGHT_CONTEXT,
            contextHash,
          })),
        );
      } catch (error) {
        logger.warn({ error }, "Failed to store heart disease insights");
      }

      const percent = (value: number) => Math.round(value * 10000) / 100;
      const labeled = this.labelClasses.map((label, index) => ({
        label,
        probability: percent(probabilities[index] ?? 0),
      }));

      const best = labeled.reduce((prev, current) =>
        current.probability > prev.probability ? current : prev,
      );

      return {
        prediction: best.label,
        probability: best.probability,
        riskLevel,
        probabilities: labeled,
        insights,
      };
    }

    const percent = (value: number) => Math.round(value * 10000) / 100;
    const labeled = this.labelClasses.map((label, index) => ({
      label,
      probability: percent(probabilities[index] ?? 0),
    }));

    const best = labeled.reduce((prev, current) =>
      current.probability > prev.probability ? current : prev,
    );

    return {
      prediction: best.label,
      probability: best.probability,
      riskLevel: "Low",
      probabilities: labeled,
      insights: [],
    };
  }
}

export const heartDiseasePredictionService =
  new HeartDiseasePredictionService();

export class DiabetesPredictionService {
  private session: ort.InferenceSession | null = null;
  private featureColumns: string[] = [];
  private labelClasses: number[] = [];
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.loadModel();
    return this.initPromise;
  }

  private resolveModelDir() {
    const override = process.env.DIABETES_MODEL_DIR;
    if (override) return path.resolve(override);
    const srcDir = DIABETES_MODEL_DIR;
    const distDir = path.resolve(
      process.cwd(),
      "dist",
      "prediction_models/diabetes_model",
    );
    if (existsSync(srcDir)) return srcDir;
    if (existsSync(distDir)) return distDir;
    return srcDir;
  }

  private async loadJsonFile<T>(filePath: string): Promise<T> {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  }

  private async loadModel() {
    const modelDir = this.resolveModelDir();
    const modelPath = path.join(modelDir, DIABETES_MODEL_FILES.model);
    const labelsPath = path.join(modelDir, DIABETES_MODEL_FILES.labels);
    const featuresPath = path.join(modelDir, DIABETES_MODEL_FILES.features);

    this.featureColumns = await this.loadJsonFile<string[]>(featuresPath);
    this.labelClasses = await this.loadJsonFile<number[]>(labelsPath);

    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
    });

    logger.info("Diabetes prediction model loaded");
  }

  private buildInputVector(input: DiabetesInput) {
    const values: Record<string, number> = {
      Pregnancies: parseNumeric(input.Pregnancies, "Pregnancies"),
      Glucose: parseNumeric(input.Glucose, "Glucose"),
      BloodPressure: parseNumeric(input.BloodPressure, "BloodPressure"),
      SkinThickness: parseNumeric(input.SkinThickness, "SkinThickness"),
      Insulin: parseNumeric(input.Insulin, "Insulin"),
      BMI: parseNumeric(input.BMI, "BMI"),
      DiabetesPedigreeFunction: parseNumeric(
        input.DiabetesPedigreeFunction,
        "DiabetesPedigreeFunction",
      ),
      Age: parseNumeric(input.Age, "Age"),
    };

    const vector = new Float32Array(this.featureColumns.length);
    this.featureColumns.forEach((feature, index) => {
      const value = values[feature];
      if (typeof value !== "number") {
        throw new Error(`Missing required feature: ${feature}`);
      }
      vector[index] = value;
    });
    return { vector, values };
  }

  async predict(
    userId: string,
    input: DiabetesInput,
  ): Promise<DiabetesPredictionResult> {
    await this.init();
    if (!this.session) throw new Error("Prediction model not available");

    const { vector: inputVector, values } = this.buildInputVector(input);
    const inputName = this.session.inputNames[0];
    const tensor = new ort.Tensor("float32", inputVector, [
      1,
      inputVector.length,
    ]);

    const outputMap = await this.session.run({ [inputName]: tensor });
    const outputTensor =
      outputMap["probabilities"] ?? outputMap[Object.keys(outputMap)[0]];

    if (
      !outputTensor ||
      typeof outputTensor !== "object" ||
      !("data" in outputTensor)
    ) {
      throw new Error("Prediction output is not a tensor");
    }

    const scores = Array.from(
      (outputTensor as ort.Tensor).data as unknown as ArrayLike<number>,
    );

    let probabilities: number[] = [];
    if (scores.length === 1 && this.labelClasses.length === 2) {
      const raw = scores[0];
      const p = raw >= 0 && raw <= 1 ? raw : sigmoid(raw);
      probabilities = [1 - p, p];
    } else if (scores.length > 1) {
      const sum = scores.reduce((total, value) => total + value, 0);
      const in01 = scores.every((value) => value >= 0 && value <= 1);
      probabilities = in01 && sum <= 1.2 ? scores : softmax(scores);
    } else {
      probabilities = scores;
    }

    if (probabilities.length !== this.labelClasses.length) {
      throw new Error("Prediction output size does not match label classes");
    }

    const positiveIndex = this.labelClasses.indexOf(1);
    if (positiveIndex !== -1) {
      const patientContext = await buildPatientContext(userId);
      const adjustments = buildDiabetesAdjustments(values, patientContext);
      let adjusted = applyDiabetesAdjustments(
        probabilities[positiveIndex] ?? 0,
        adjustments,
      );

      const geminiRefinement = await refineDiabetesWithGemini({
        probability: Math.round(adjusted * 1000) / 10,
        inputProfile: values,
        patientContext,
      });
      if (typeof geminiRefinement?.adjustedProbability === "number") {
        adjusted = clamp(
          geminiRefinement.adjustedProbability / 100,
          0.01,
          0.99,
        );
      }
      probabilities = [...probabilities];
      probabilities[positiveIndex] = adjusted;
      if (probabilities.length === 2) {
        const otherIndex = positiveIndex === 0 ? 1 : 0;
        probabilities[otherIndex] = clamp(1 - adjusted, 0.01, 0.99);
      } else {
        const sum =
          probabilities.reduce((total, value) => total + value, 0) || 1;
        probabilities = probabilities.map((value) => value / sum);
      }

      const riskLevel = getRiskLevel(adjusted);
      const insights = buildDiabetesInsights({
        probability: adjusted,
        riskLevel,
        adjustments,
        geminiSummary: geminiRefinement?.summary,
      });

      const contextHash = buildContextHash(
        JSON.stringify({
          Pregnancies: values.Pregnancies,
          Glucose: values.Glucose,
          BloodPressure: values.BloodPressure,
          SkinThickness: values.SkinThickness,
          Insulin: values.Insulin,
          BMI: values.BMI,
          DiabetesPedigreeFunction: values.DiabetesPedigreeFunction,
          Age: values.Age,
          riskLevel,
        }),
      );

      try {
        await healthInsightRepository.deleteByContext(
          userId,
          DIABETES_INSIGHT_CONTEXT,
          contextHash,
        );
        await healthInsightRepository.createMany(
          insights.map((insight) => ({
            userId,
            insightTitle: insight.title,
            description: insight.description,
            priority: insight.priority,
            contextType: DIABETES_INSIGHT_CONTEXT,
            contextHash,
          })),
        );
      } catch (error) {
        logger.warn({ error }, "Failed to store diabetes insights");
      }

      const percent = (value: number) => Math.round(value * 10000) / 100;
      const labeled = this.labelClasses.map((label, index) => ({
        label,
        probability: percent(probabilities[index] ?? 0),
      }));

      const best = labeled.reduce((prev, current) =>
        current.probability > prev.probability ? current : prev,
      );

      return {
        prediction: best.label,
        probability: best.probability,
        riskLevel,
        probabilities: labeled,
        insights,
      };
    }

    const percent = (value: number) => Math.round(value * 10000) / 100;
    const labeled = this.labelClasses.map((label, index) => ({
      label,
      probability: percent(probabilities[index] ?? 0),
    }));

    const best = labeled.reduce((prev, current) =>
      current.probability > prev.probability ? current : prev,
    );

    return {
      prediction: best.label,
      probability: best.probability,
      riskLevel: "Low",
      probabilities: labeled,
      insights: [],
    };
  }
}

export const diabetesPredictionService = new DiabetesPredictionService();

export class BrainTumorPredictionService {
  private session: ort.InferenceSession | null = null;
  private labelClasses: string[] = [];
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.loadModel();
    return this.initPromise;
  }

  private resolveModelDir() {
    const override = process.env.BRAIN_TUMOR_MODEL_DIR;
    if (override) return path.resolve(override);
    const srcDir = BRAIN_TUMOR_MODEL_DIR;
    const distDir = path.resolve(
      process.cwd(),
      "dist",
      "prediction_models/brain_models",
    );
    if (existsSync(srcDir)) return srcDir;
    if (existsSync(distDir)) return distDir;
    return srcDir;
  }

  private async loadJsonFile<T>(filePath: string): Promise<T> {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  }

  private normalizeLabelClasses(
    labels: Record<string, string> | string[],
  ): string[] {
    if (Array.isArray(labels)) {
      return labels;
    }
    return Object.entries(labels)
      .map(([key, value]) => [Number(key), value] as [number, string])
      .filter(([key]) => Number.isFinite(key))
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value);
  }

  private async loadModel() {
    const modelDir = this.resolveModelDir();
    const modelPath = path.join(modelDir, BRAIN_TUMOR_MODEL_FILES.model);
    const labelsPath = path.join(modelDir, BRAIN_TUMOR_MODEL_FILES.labels);

    const labelPayload = await this.loadJsonFile<Record<string, string>>(
      labelsPath,
    );
    this.labelClasses = this.normalizeLabelClasses(labelPayload);

    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
    });

    logger.info("Brain tumor prediction model loaded");
  }

  private async preprocessImage(buffer: Buffer) {
    const { data, info } = await sharp(buffer)
      .grayscale()
      .resize(28, 28, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.channels !== 1) {
      throw new Error("Image preprocessing failed to produce grayscale output");
    }

    const floatData = new Float32Array(data.length);
    for (let i = 0; i < data.length; i += 1) {
      floatData[i] = data[i];
    }
    return floatData;
  }

  private buildInputTensor(data: Float32Array) {
    if (!this.session) throw new Error("Prediction model not available");
    const inputName = this.session.inputNames[0];
    const inputMetadata = this.session
      .inputMetadata as unknown as
      | Array<{
          name?: string;
          dimensions?: Array<number | string | null | undefined>;
          shape?: Array<number | string | null | undefined>;
        }>
      | Record<
          string,
          {
            dimensions?: Array<number | string | null | undefined>;
            shape?: Array<number | string | null | undefined>;
          }
        >;
    const meta = Array.isArray(inputMetadata)
      ? inputMetadata.find((item) => item.name === inputName)
      : inputMetadata?.[inputName];
    const dimsRaw = meta?.dimensions ?? meta?.shape ?? [];
    const dims = (dimsRaw as Array<number | string | null | undefined>).map(
      (dim: number | string | null | undefined) =>
        typeof dim === "number" && Number.isFinite(dim) && dim > 0
          ? dim
          : undefined,
    );

    const defaultShape = [1, data.length];
    let shape = defaultShape;
    if (dims.length === 2) {
      const filled = [dims[0] ?? 1, dims[1] ?? data.length];
      const total = filled.reduce(
        (acc: number, value: number) => acc * value,
        1,
      );
      shape = total === data.length ? filled : defaultShape;
    } else if (dims.length === 3 || dims.length === 4) {
      const filled = dims.map((dim: number | undefined) => dim ?? 1);
      const total = filled.reduce(
        (acc: number, value: number) => acc * value,
        1,
      );
      shape = total === data.length ? filled : defaultShape;
    }

    return {
      inputName,
      tensor: new ort.Tensor("float32", data, shape),
    };
  }

  async predict(
    userId: string,
    imageBuffer: Buffer,
  ): Promise<BrainTumorPredictionResult> {
    await this.init();
    if (!this.session) throw new Error("Prediction model not available");
    if (!this.labelClasses.length) {
      throw new Error("Brain tumor labels not available");
    }

    const inputData = await this.preprocessImage(imageBuffer);
    const { inputName, tensor } = this.buildInputTensor(inputData);

    const outputMap = await this.session.run({ [inputName]: tensor });
    const outputTensor =
      outputMap["probabilities"] ?? outputMap[Object.keys(outputMap)[0]];

    if (
      !outputTensor ||
      typeof outputTensor !== "object" ||
      !("data" in outputTensor)
    ) {
      throw new Error("Prediction output is not a tensor");
    }

    const scores = Array.from(
      (outputTensor as ort.Tensor).data as unknown as ArrayLike<number>,
    );

    let probabilities: number[] = [];
    if (scores.length === 1 && this.labelClasses.length === 2) {
      const raw = scores[0];
      const p = raw >= 0 && raw <= 1 ? raw : sigmoid(raw);
      probabilities = [1 - p, p];
    } else if (scores.length > 1) {
      const sum = scores.reduce((total, value) => total + value, 0);
      const in01 = scores.every((value) => value >= 0 && value <= 1);
      probabilities = in01 && sum <= 1.2 ? scores : softmax(scores);
    } else {
      probabilities = scores;
    }

    if (probabilities.length !== this.labelClasses.length) {
      throw new Error(
        "Prediction output size does not match brain tumor labels",
      );
    }

    const percent = (value: number) => Math.round(value * 10000) / 100;
    const labeled = this.labelClasses.map((label, index) => ({
      label,
      probability: percent(probabilities[index] ?? 0),
    }));

    const best = labeled.reduce((prev, current) =>
      current.probability > prev.probability ? current : prev,
    );

    const insights = buildBrainTumorInsights({
      predictionLabel: best.label,
      probabilityPercent: best.probability,
    });

    const contextHash = buildContextHash(
      JSON.stringify({
        prediction: best.label,
        probability: best.probability,
        probabilities: labeled,
      }),
    );

    try {
      await healthInsightRepository.deleteByContext(
        userId,
        BRAIN_TUMOR_INSIGHT_CONTEXT,
        contextHash,
      );
      await healthInsightRepository.createMany(
        insights.map((insight) => ({
          userId,
          insightTitle: insight.title,
          description: insight.description,
          priority: insight.priority,
          contextType: BRAIN_TUMOR_INSIGHT_CONTEXT,
          contextHash,
        })),
      );
    } catch (error) {
      logger.warn({ error }, "Failed to store brain tumor insights");
    }

    return {
      prediction: best.label,
      probability: best.probability,
      probabilities: labeled,
      insights,
    };
  }
}

export const brainTumorPredictionService =
  new BrainTumorPredictionService();

export class TuberculosisPredictionService {
  private session: ort.InferenceSession | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly labelClasses = TUBERCULOSIS_LABEL_CLASSES;

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.loadModel();
    return this.initPromise;
  }

  private resolveModelDir() {
    const override = process.env.TUBERCULOSIS_MODEL_DIR;
    if (override) return path.resolve(override);
    const srcDir = TUBERCULOSIS_MODEL_DIR;
    const distDir = path.resolve(
      process.cwd(),
      "dist",
      "prediction_models/tuberculosis",
    );
    if (existsSync(srcDir)) return srcDir;
    if (existsSync(distDir)) return distDir;
    return srcDir;
  }

  private async loadModel() {
    const modelDir = this.resolveModelDir();
    const modelPath = path.join(modelDir, TUBERCULOSIS_MODEL_FILES.model);
    this.session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
    });

    logger.info("Tuberculosis prediction model loaded");
  }

  private async preprocessImage(buffer: Buffer) {
    const { data, info } = await sharp(buffer)
      .removeAlpha()
      .resize(224, 224, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.channels < 3) {
      throw new Error("Image preprocessing failed to produce RGB output");
    }

    const width = info.width;
    const height = info.height;
    const pixelCount = width * height;
    const floatData = new Float32Array(3 * pixelCount);

    for (let i = 0; i < pixelCount; i += 1) {
      const offset = i * info.channels;
      floatData[i] = data[offset] / 255;
      floatData[pixelCount + i] = data[offset + 1] / 255;
      floatData[pixelCount * 2 + i] = data[offset + 2] / 255;
    }

    return { data: floatData, width, height };
  }

  private buildInputTensor(data: Float32Array, width: number, height: number) {
    if (!this.session) throw new Error("Prediction model not available");
    const inputName = this.session.inputNames[0];

    const inputMetadata = this.session
      .inputMetadata as unknown as
      | Array<{
          name?: string;
          dimensions?: Array<number | string | null | undefined>;
          shape?: Array<number | string | null | undefined>;
        }>
      | Record<
          string,
          {
            dimensions?: Array<number | string | null | undefined>;
            shape?: Array<number | string | null | undefined>;
          }
        >;
    const meta = Array.isArray(inputMetadata)
      ? inputMetadata.find((item) => item.name === inputName)
      : inputMetadata?.[inputName];
    const dimsRaw = meta?.dimensions ?? meta?.shape ?? [];
    const dims = (dimsRaw as Array<number | string | null | undefined>).map(
      (dim: number | string | null | undefined) =>
        typeof dim === "number" && Number.isFinite(dim) && dim > 0
          ? dim
          : undefined,
    );

    const defaultShape = [1, 3, height, width];
    let shape = defaultShape;
    if (dims.length >= 4) {
      const normalized = [
        dims[0] ?? 1,
        dims[1] ?? 3,
        dims[2] ?? height,
        dims[3] ?? width,
      ];
      const total = normalized.reduce(
        (acc: number, value: number) => acc * value,
        1,
      );
      shape = total === data.length ? normalized : defaultShape;
    }

    return {
      inputName,
      tensor: new ort.Tensor("float32", data, shape),
    };
  }

  async predict(
    userId: string,
    imageBuffer: Buffer,
  ): Promise<TuberculosisPredictionResult> {
    await this.init();
    if (!this.session) throw new Error("Prediction model not available");

    const inputData = await this.preprocessImage(imageBuffer);
    const { inputName, tensor } = this.buildInputTensor(
      inputData.data,
      inputData.width,
      inputData.height,
    );

    const outputMap = await this.session.run({ [inputName]: tensor });
    const outputTensor = outputMap["output"] ?? outputMap[Object.keys(outputMap)[0]];

    if (
      !outputTensor ||
      typeof outputTensor !== "object" ||
      !("data" in outputTensor)
    ) {
      throw new Error("Prediction output is not a tensor");
    }

    const scores = Array.from(
      (outputTensor as ort.Tensor).data as unknown as ArrayLike<number>,
    );

    let probabilities: number[] = [];
    if (scores.length === 1 && this.labelClasses.length === 2) {
      const raw = scores[0];
      const p = raw >= 0 && raw <= 1 ? raw : sigmoid(raw);
      probabilities = [1 - p, p];
    } else if (scores.length > 1) {
      const sum = scores.reduce((total, value) => total + value, 0);
      const in01 = scores.every((value) => value >= 0 && value <= 1);
      probabilities = in01 && sum <= 1.2 ? scores : softmax(scores);
    } else {
      probabilities = scores;
    }

    if (probabilities.length !== this.labelClasses.length) {
      throw new Error("Prediction output size does not match tuberculosis labels");
    }

    const percent = (value: number) => Math.round(value * 10000) / 100;
    const labeled = this.labelClasses.map((label, index) => ({
      label,
      probability: percent(probabilities[index] ?? 0),
    }));

    const best = labeled.reduce((prev, current) =>
      current.probability > prev.probability ? current : prev,
    );
    const tbProbability = probabilities[1] ?? 0;
    const riskLevel = getRiskLevel(tbProbability);

    const insights = buildTuberculosisInsights({
      predictionLabel: best.label,
      probabilityPercent: best.probability,
      tbProbability,
    });

    const contextHash = buildContextHash(
      JSON.stringify({
        prediction: best.label,
        probability: best.probability,
        probabilities: labeled,
      }),
    );

    try {
      await healthInsightRepository.deleteByContext(
        userId,
        TUBERCULOSIS_INSIGHT_CONTEXT,
        contextHash,
      );
      await healthInsightRepository.createMany(
        insights.map((insight) => ({
          userId,
          insightTitle: insight.title,
          description: insight.description,
          priority: insight.priority,
          contextType: TUBERCULOSIS_INSIGHT_CONTEXT,
          contextHash,
        })),
      );
    } catch (error) {
      logger.warn({ error }, "Failed to store tuberculosis insights");
    }

    return {
      prediction: best.label,
      probability: best.probability,
      probabilities: labeled,
      riskLevel,
      insights,
    };
  }
}

export const tuberculosisPredictionService =
  new TuberculosisPredictionService();
