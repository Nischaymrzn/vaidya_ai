import { env } from "../config/env";
import { UserDataRepository } from "../repositories/user-data.repository";
import { VitalsRepository } from "../repositories/vitals.repository";
import { SymptomsRepository } from "../repositories/symptoms.repository";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { MedicationsRepository } from "../repositories/medications.repository";
import { AllergyRepository } from "../repositories/allergy.repository";
import { ImmunizationRepository } from "../repositories/immunization.repository";
import { MedicalFileRepository } from "../repositories/medical-file.repository";
import { RiskAssessmentRepository } from "../repositories/risk-assessment.repository";
import type { VitalsDb } from "../models/vitals.model";
import type { SymptomsDb } from "../models/symptoms.model";
import type { MedicationsDb } from "../models/medications.model";
import type { AllergyDb } from "../models/allergy.model";
import type { ImmunizationDb } from "../models/immunization.model";
import type { MedicalFileDb } from "../models/medical-file.model";
import type { MedicalRecordDb } from "../models/medical-record.model";
import type { RiskAssessmentDb } from "../models/risk-assessment.model";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  userId: string;
  messages: ChatMessage[];
  doctor?: string;
  includeHealthContext?: boolean;
};

const userDataRepository = new UserDataRepository();
const vitalsRepository = new VitalsRepository();
const symptomsRepository = new SymptomsRepository();
const medicalRecordRepository = new MedicalRecordRepository();
const medicationsRepository = new MedicationsRepository();
const allergyRepository = new AllergyRepository();
const immunizationRepository = new ImmunizationRepository();
const medicalFileRepository = new MedicalFileRepository();
const riskAssessmentRepository = new RiskAssessmentRepository();

const MAX_ITEMS = Math.max(3, Number(process.env.AI_CHAT_MAX_ITEMS ?? "8"));
const MAX_OUTPUT_TOKENS = Math.max(
  400,
  Number(process.env.AI_CHAT_MAX_TOKENS ?? "1200"),
);

const doctorProfiles: Record<string, { name: string; specialty: string }> = {
  "nischay-maharan": {
    name: "Dr. Nischay Maharan",
    specialty: "General Physician AI",
  },
  "trishan-wagle": {
    name: "Dr. Trishan Wagle",
    specialty: "Cardiology AI Specialist",
  },
  "albert-maharan": {
    name: "Dr. Albert Maharan",
    specialty: "Endocrinology AI Specialist",
  },
  "rabin-tamang": {
    name: "Dr. Rabin Tamang",
    specialty: "Mental Wellness AI Specialist",
  },
  "kiran-rana": {
    name: "Dr. Kiran Rana",
    specialty: "Respiratory Health AI Specialist",
  },
};

const doctorScopes: Record<string, string[]> = {
  "nischay-maharan": [
    "general wellness",
    "symptom evaluation",
    "preventive care",
    "vital review",
    "risk assessment",
  ],
  "trishan-wagle": [
    "heart health",
    "blood pressure",
    "cholesterol insights",
    "cardiac risk factors",
    "ECG guidance",
  ],
  "albert-maharan": [
    "diabetes care",
    "glucose tracking",
    "thyroid health",
    "hormonal balance",
    "metabolic risk",
  ],
  "rabin-tamang": [
    "stress management",
    "anxiety support",
    "mood tracking",
    "sleep health",
    "behavioral insights",
  ],
  "kiran-rana": [
    "lung function",
    "breathing assessment",
    "oxygen monitoring",
    "infection screening",
    "asthma care",
  ],
};

const SEVERE_SYMPTOMS_PATTERNS = [
  /\bheart attack\b/i,
  /\bstroke\b/i,
  /\bchest pain\b/i,
  /\bcan'?t breathe\b/i,
  /\bdifficulty breathing\b/i,
  /\bbreathing difficulty\b/i,
  /\bstruggling to breathe\b/i,
  /\bcan't catch (my|your) breath\b/i,
  /\bunable to breathe\b/i,
  /\btrouble breathing\b/i,
  /\bshort(ness)? of breath\b/i,
  /\bunconscious\b/i,
  /\bloss of consciousness\b/i,
  /\bpassed out\b/i,
  /\bunresponsive\b/i,
  /\bfaint(ed|ing)?\b/i,
  /\bsevere\b.*\bpain\b/i,
  /\bseizure\b/i,
  /\bconvulsion(s)?\b/i,
  /\bsevere bleeding\b/i,
  /\bbleeding heavily\b/i,
  /\bbleeding a lot\b/i,
  /\buncontrolled bleeding\b/i,
  /\bhemorrhage\b/i,
  /\bblood(ing)?\b.*\bwon't stop\b/i,
  /\bsuicidal\b|\bself harm\b/i,
  /\bfever\b.*\b104\b\s*(?:\u00b0\s*)?(?:f|fahrenheit)\b/i,
  /\b104\b\s*(?:\u00b0\s*)?(?:f|fahrenheit)\b.*\bfever\b/i,
  /\bfever\b.*\b40\b\s*(?:\u00b0\s*)?(?:c|celsius)\b/i,
  /\b40\b\s*(?:\u00b0\s*)?(?:c|celsius)\b.*\bfever\b/i,
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|yo)\b/i,
  /\bgood (morning|afternoon|evening)\b/i,
  /\bhow are you\b/i,
  /\bthank(s| you)\b/i,
];

const OVERALL_HEALTH_PATTERNS = [
  /\bhow (is|are) my health\b/i,
  /\bhealth condition\b/i,
  /\bhealth status\b/i,
  /\boverall health\b/i,
  /\bhow am i doing\b/i,
];

const getEmergencyResponse =
  "I'm very concerned about what you're describing. This could be an emergency. Please call your local emergency number or go to the nearest emergency department right now. If someone is with you, ask them to help you get care immediately. Are you able to call for help right now?";
const getGreetingResponse =
  "Hi there! I'm glad you're here. Tell me what you'd like help with today, or share a symptom or concern you're noticing.";

const getLastUserMessage = (messages: ChatMessage[]) =>
  [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

const countUserMessages = (messages: ChatMessage[]) =>
  messages.reduce((count, message) => (message.role === "user" ? count + 1 : count), 0);

const toDate = (value?: unknown) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value?: unknown) => {
  const date = toDate(value);
  return date ? date.toISOString().split("T")[0] : null;
};

const formatDateTime = (value?: unknown) => {
  const date = toDate(value);
  return date ? date.toISOString() : null;
};

const truncate = (value?: string | null, max = 160) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}...` : trimmed;
};

const calcAge = (dob?: unknown) => {
  const date = toDate(dob);
  if (!date) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const m = now.getUTCMonth() - date.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < date.getUTCDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

const formatVitalsSnapshot = (vital?: Partial<VitalsDb> | null) => {
  if (!vital) return null;
  return {
    recordedAt: formatDateTime(vital.recordedAt ?? (vital as any).createdAt),
    systolicBp: vital.systolicBp ?? null,
    diastolicBp: vital.diastolicBp ?? null,
    glucoseLevel: vital.glucoseLevel ?? null,
    heartRate: vital.heartRate ?? null,
    weight: vital.weight ?? null,
    height: vital.height ?? null,
    bmi: vital.bmi ?? null,
  };
};

const summarizeVitals = (items: VitalsDb[]) =>
  items.slice(0, MAX_ITEMS).map((vital) => ({
    recordedAt: formatDateTime(vital.recordedAt ?? (vital as any).createdAt),
    systolicBp: vital.systolicBp ?? null,
    diastolicBp: vital.diastolicBp ?? null,
    glucoseLevel: vital.glucoseLevel ?? null,
    heartRate: vital.heartRate ?? null,
    weight: vital.weight ?? null,
    height: vital.height ?? null,
    bmi: vital.bmi ?? null,
    notes: truncate(vital.notes),
  }));

const summarizeSymptoms = (items: SymptomsDb[]) =>
  items.slice(0, MAX_ITEMS).map((symptom) => ({
    loggedAt: formatDateTime(symptom.loggedAt ?? (symptom as any).createdAt),
    symptomList: symptom.symptomList ?? [],
    severity: symptom.severity ?? null,
    status: symptom.status ?? null,
    durationDays: symptom.durationDays ?? null,
    diagnosis: symptom.diagnosis ?? symptom.disease ?? null,
    notes: truncate(symptom.notes),
  }));

const summarizeMedications = (items: MedicationsDb[]) =>
  items.slice(0, MAX_ITEMS).map((med) => ({
    name: med.medicineName ?? null,
    dosage: med.dosage ?? null,
    frequency: med.frequency ?? null,
    durationDays: med.durationDays ?? null,
    startDate: formatDate(med.startDate),
    endDate: formatDate(med.endDate),
    purpose: med.purpose ?? med.diagnosis ?? med.disease ?? null,
    notes: truncate(med.notes),
  }));

const summarizeAllergies = (items: AllergyDb[]) =>
  items.slice(0, MAX_ITEMS).map((allergy) => ({
    allergen: allergy.allergen ?? null,
    type: allergy.type ?? null,
    reaction: allergy.reaction ?? null,
    severity: allergy.severity ?? null,
    status: allergy.status ?? null,
    onsetDate: formatDate(allergy.onsetDate),
    recordedAt: formatDate(allergy.recordedAt ?? (allergy as any).createdAt),
    notes: truncate(allergy.notes),
  }));

const summarizeImmunizations = (items: ImmunizationDb[]) =>
  items.slice(0, MAX_ITEMS).map((immunization) => ({
    vaccineName: immunization.vaccineName ?? null,
    date: formatDate(immunization.date),
    doseNumber: immunization.doseNumber ?? null,
    series: immunization.series ?? null,
    manufacturer: immunization.manufacturer ?? null,
    provider: immunization.provider ?? null,
    nextDue: formatDate(immunization.nextDue),
    notes: truncate(immunization.notes),
  }));

const summarizeMedicalFiles = (items: MedicalFileDb[]) =>
  items.slice(0, MAX_ITEMS).map((file) => ({
    name: file.name ?? null,
    type: file.type ?? null,
    size: file.size ?? null,
    uploadedAt: formatDateTime(file.uploadedAt ?? (file as any).createdAt),
  }));

const summarizeMedicalRecords = (items: MedicalRecordDb[]) =>
  items.slice(0, MAX_ITEMS).map((record) => ({
    title: record.title ?? null,
    recordType: record.recordType ?? null,
    category: record.category ?? null,
    provider: record.provider ?? null,
    recordDate: formatDate(record.recordDate),
    visitType: record.visitType ?? null,
    diagnosis: record.diagnosis ?? null,
    diagnosisStatus: record.diagnosisStatus ?? null,
    status: record.status ?? null,
    notes: truncate(record.notes ?? record.content, 180),
  }));

const formatRiskAssessment = (assessment?: RiskAssessmentDb | null) => {
  if (!assessment) return null;
  return {
    assessmentDate: formatDateTime(
      assessment.assessmentDate ?? (assessment as any).createdAt,
    ),
    vaidyaScore: assessment.vaidyaScore ?? null,
    riskLevel: assessment.riskLevel ?? null,
    riskScore: assessment.riskScore ?? null,
    confidenceScore: assessment.confidenceScore ?? null,
    predictedCondition: assessment.predictedCondition ?? null,
  };
};

const extractConditions = (
  records: MedicalRecordDb[],
  symptoms: SymptomsDb[],
) => {
  const items = new Set<string>();
  records.forEach((record) => {
    if (record.diagnosis) items.add(record.diagnosis.trim());
    if (
      record.recordType?.toLowerCase() === "condition" &&
      record.title?.trim()
    ) {
      items.add(record.title.trim());
    }
  });
  symptoms.forEach((symptom) => {
    if (symptom.diagnosis) items.add(symptom.diagnosis.trim());
    if (symptom.disease) items.add(symptom.disease.trim());
  });
  return Array.from(items).filter(Boolean).slice(0, 12);
};

const summarizeActiveMedications = (items: MedicationsDb[]) => {
  const now = new Date();
  return items
    .filter((med) => {
      if (!med.endDate) return true;
      const end = toDate(med.endDate);
      return end ? end >= now : true;
    })
    .slice(0, MAX_ITEMS)
    .map((med) => ({
      name: med.medicineName ?? null,
      dosage: med.dosage ?? null,
      frequency: med.frequency ?? null,
      startDate: formatDate(med.startDate),
      endDate: formatDate(med.endDate),
      purpose: med.purpose ?? med.diagnosis ?? med.disease ?? null,
    }));
};

const buildHealthContext = async (userId: string) => {
  const [
    userData,
    allVitals,
    allSymptoms,
    medicalRecordsPage,
    medications,
    allergies,
    immunizations,
    medicalFiles,
    latestRiskAssessment,
  ] = await Promise.all([
    userDataRepository.getByUserId(userId),
    vitalsRepository.getAllForUser(userId),
    symptomsRepository.getAllForUser(userId),
    medicalRecordRepository.getAllForUser(userId, {
      limit: MAX_ITEMS,
      page: 1,
    }),
    medicationsRepository.getAllForUser(userId),
    allergyRepository.getAllForUser(userId),
    immunizationRepository.getAllForUser(userId),
    medicalFileRepository.getAllForUser(userId),
    riskAssessmentRepository.getLatestForUser(userId),
  ]);

  const recentVitals = allVitals.slice(0, MAX_ITEMS);
  const recentSymptoms = allSymptoms.slice(0, MAX_ITEMS);
  const conditions = extractConditions(medicalRecordsPage.data ?? [], allSymptoms);
  const activeMedications = summarizeActiveMedications(medications);

  const latestVitals =
    formatVitalsSnapshot(userData?.latestVitals) ??
    formatVitalsSnapshot(recentVitals[0]) ??
    null;

  const profile = {
    fullName: userData?.fullName ?? null,
    dob: formatDate(userData?.dob),
    age: calcAge(userData?.dob),
    gender: userData?.gender ?? null,
    bloodGroup: userData?.bloodGroup ?? null,
    heightCm: userData?.heightCm ?? null,
    weightKg: userData?.weightKg ?? null,
  };

  const context = {
    profile,
    totals: {
      vitals: allVitals.length,
      symptoms: allSymptoms.length,
      medicalRecords: medicalRecordsPage.total ?? medicalRecordsPage.data.length,
      medications: medications.length,
      allergies: allergies.length,
      immunizations: immunizations.length,
      medicalFiles: medicalFiles.length,
    },
    riskAssessment: formatRiskAssessment(latestRiskAssessment),
    conditions,
    latestVitals,
    vitals: summarizeVitals(recentVitals),
    symptoms: summarizeSymptoms(recentSymptoms),
    medicalRecords: summarizeMedicalRecords(medicalRecordsPage.data ?? []),
    activeMedications,
    medications: summarizeMedications(medications),
    allergies: summarizeAllergies(allergies),
    immunizations: summarizeImmunizations(immunizations),
    medicalFiles: summarizeMedicalFiles(medicalFiles),
  };

  return context;
};

const buildSystemPrompt = (
  profile: { name: string; specialty: string },
  scopeList: string[],
  includeHealthContext: boolean,
) => {
  return [
    `You are ${profile.name}, a licensed, highly experienced clinical physician and ${profile.specialty} for a digital health platform.`,
    "You conduct structured, professional medical consultations via voice or text.",
    "Speak clearly, calmly, and professionally. Be warm, personal, and human while staying clinical.",
    "Write as if speaking one-to-one with a real patient. Use brief empathy, reflect key details, and avoid robotic phrasing.",
    `Your primary focus areas are: ${scopeList.join(", ")}.`,
    "Stay in character as a specialist in your field. Let your domain knowledge shape questions and guidance.",
    "Use clear, professional language and explain clinical terms briefly when needed.",
    "Use the full conversation history; do not reset context unless explicitly instructed.",
    "Always incorporate the provided health context (history, records, medications, allergies, vitals, and risk assessment) into your guidance.",
    "If the user asks about their overall health condition or status, summarize using the latest Vaidya score and risk level, then ask which aspect they want to explore more (e.g., heart health, blood pressure, glucose, medications). If no Vaidya score is available, say that and recommend running a risk analysis.",
    "If the user asks about heart health, prioritize blood pressure, heart rate, BMI, relevant symptoms, conditions, and any recent risk assessment.",
    "Stay tightly focused on the user's stated concern.",
    "Ask only one question per response. Do not stack or combine multiple questions.",
    "If the user provides numbers or measurements, repeat them back and confirm them before interpreting.",
    "If you are unsure or missing details, say so and ask targeted follow-up questions.",
    "For non-emergency cases, gather details step-by-step: onset, duration, severity, associated symptoms, medical history, medications, allergies, immunizations, and risk factors as relevant.",
    "Provide evidence-based guidance and possible differential considerations without making a definitive diagnosis.",
    "Offer safe next steps such as home care, monitoring guidance, or when to seek in-person care.",
    "Always finish your response completely in a single message. If space is limited, shorten the response instead of cutting it off.",
    "Do not prescribe or recommend controlled or prescription-only medications.",
    "If the user asks for medication advice, check allergies and current medications first, mention key contraindications, and keep suggestions limited to common OTC options when appropriate. Do not provide dosing, frequency, or duration.",
    "If the user asks for a dose or schedule, explain that you cannot give dosing and advise following the package label or speaking to a clinician or pharmacist.",
    "If severe symptoms are present (e.g., chest pain, difficulty breathing, loss of consciousness, seizures, severe bleeding, fever > 104 F), immediately advise urgent medical attention and do not continue routine questioning.",
    "Do not mention US-specific hotlines or resources. If location is unknown, say 'your local emergency number' or 'nearest emergency department.'",
    "If the user indicates they are in Nepal, tailor guidance for Nepal and refer to local hospitals or clinics such as Bir Hospital or Tribhuvan University Teaching Hospital when appropriate.",
    "End with exactly one clear question that moves the conversation forward.",
    "Keep responses concise and structured. Never end mid-sentence; always complete the answer before asking a question.",
    "Never mention being an AI or a pharmacist.",
    "Only discuss stored health data if consent is granted.",
    "If consent is not granted and the user asks to review stored data, ask for permission.",
    `Consent status: ${includeHealthContext ? "granted" : "not granted"}.`,
  ].join(" ");
};

type HealthContext = Awaited<ReturnType<typeof buildHealthContext>>;

const buildOverallHealthReply = (context: HealthContext) => {
  const risk = context.riskAssessment;
  if (!risk || typeof risk.vaidyaScore !== "number") {
    return null;
  }

  const parts: string[] = [];
  const assessmentDate = risk.assessmentDate
    ? toDate(risk.assessmentDate)
    : null;
  const dateLabel = assessmentDate
    ? ` on ${assessmentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`
    : "";
  const riskLevel = risk.riskLevel ? risk.riskLevel.toLowerCase() : "unknown";

  parts.push(
    `Based on your latest Vaidya score of ${risk.vaidyaScore}${riskLevel !== "unknown" ? ` (${riskLevel} risk)` : ""}${dateLabel}, your overall health risk looks ${riskLevel !== "unknown" ? riskLevel : "undetermined"} right now.`,
  );

  const vitals = context.latestVitals;
  const vitalsLine = [
    vitals?.systolicBp && vitals?.diastolicBp
      ? `BP ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`
      : null,
    typeof vitals?.heartRate === "number" ? `HR ${vitals.heartRate} bpm` : null,
    typeof vitals?.glucoseLevel === "number"
      ? `Glucose ${vitals.glucoseLevel} mg/dL`
      : null,
    typeof vitals?.bmi === "number" ? `BMI ${vitals.bmi}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  if (vitalsLine) {
    parts.push(`Latest vitals: ${vitalsLine}.`);
  }

  if (context.conditions.length) {
    parts.push(`Recorded conditions: ${context.conditions.join(", ")}.`);
  }

  parts.push(
    "Which aspect would you like to know more about (heart health, blood pressure, glucose, medications, or symptoms)?",
  );

  return parts.join(" ");
};

const buildContents = (contextText: string | null, messages: ChatMessage[]) => {
  const contents: Array<{ role: "user" | "model"; parts: { text: string }[] }> =
    [];
  if (contextText) {
    contents.push({
      role: "user",
      parts: [
        {
          text:
            "The following JSON contains the user's health context. Use it only when relevant:\n" +
            contextText,
        },
      ],
    });
  }

  messages.forEach((message) => {
    const role = message.role === "assistant" ? "model" : "user";
    contents.push({
      role,
      parts: [{ text: message.content }],
    });
  });

  return contents;
};

const callGeminiChat = async (
  systemPrompt: string,
  contextText: string | null,
  messages: ChatMessage[],
) => {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  const endpoint =
    env.GEMINI_API_URL ||
    process.env.GEMINI_API_URL ||
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: buildContents(contextText, messages),
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          topP: 0.9,
        },
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
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((part) => part.text ?? "").join("").trim();
    return text || "I'm sorry, I couldn't respond.";
  } finally {
    clearTimeout(timeout);
  }
};

export class AiChatService {
  async reply(payload: ChatRequest) {
    const { userId, messages, doctor } = payload;
    const includeHealthContext = true;

    const lastUserMessage = getLastUserMessage(messages).trim();
    if (lastUserMessage) {
      const isSevere = SEVERE_SYMPTOMS_PATTERNS.some((pattern) =>
        pattern.test(lastUserMessage),
      );
      if (isSevere) {
        return getEmergencyResponse;
      }
      const isGreeting = GREETING_PATTERNS.some((pattern) =>
        pattern.test(lastUserMessage),
      );
      if (isGreeting && countUserMessages(messages) <= 1) {
        return getGreetingResponse;
      }
    }

    const profile = doctorProfiles[doctor ?? ""] ?? doctorProfiles["nischay-maharan"];
    const scopeList = doctorScopes[doctor ?? ""] ?? doctorScopes["nischay-maharan"];
    const systemPrompt = buildSystemPrompt(profile, scopeList, includeHealthContext);

    const healthContext = includeHealthContext
      ? await buildHealthContext(userId)
      : null;
    const contextText = healthContext ? JSON.stringify(healthContext, null, 2) : null;

    if (lastUserMessage && healthContext) {
      const isOverallHealth = OVERALL_HEALTH_PATTERNS.some((pattern) =>
        pattern.test(lastUserMessage),
      );
      if (isOverallHealth) {
        const summary = buildOverallHealthReply(healthContext);
        if (summary) {
          return summary;
        }
      }
    }

    return callGeminiChat(systemPrompt, contextText, messages);
  }
}

