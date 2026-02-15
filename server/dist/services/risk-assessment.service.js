"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessmentService = void 0;
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const risk_assessment_repository_1 = require("../repositories/risk-assessment.repository");
const risk_vitals_repository_1 = require("../repositories/risk-vitals.repository");
const risk_symptoms_repository_1 = require("../repositories/risk-symptoms.repository");
const health_insight_repository_1 = require("../repositories/health-insight.repository");
const report_insight_repository_1 = require("../repositories/report-insight.repository");
const vitals_repository_1 = require("../repositories/vitals.repository");
const symptoms_repository_1 = require("../repositories/symptoms.repository");
const lab_test_repository_1 = require("../repositories/lab-test.repository");
const medications_repository_1 = require("../repositories/medications.repository");
const user_data_repository_1 = require("../repositories/user-data.repository");
const mongoose_1 = __importDefault(require("mongoose"));
const riskAssessmentRepository = new risk_assessment_repository_1.RiskAssessmentRepository();
const riskVitalsRepository = new risk_vitals_repository_1.RiskVitalsRepository();
const riskSymptomsRepository = new risk_symptoms_repository_1.RiskSymptomsRepository();
const healthInsightRepository = new health_insight_repository_1.HealthInsightRepository();
const reportInsightRepository = new report_insight_repository_1.ReportInsightRepository();
const vitalsRepository = new vitals_repository_1.VitalsRepository();
const symptomsRepository = new symptoms_repository_1.SymptomsRepository();
const labTestRepository = new lab_test_repository_1.LabTestRepository();
const medicationsRepository = new medications_repository_1.MedicationsRepository();
const userDataRepository = new user_data_repository_1.UserDataRepository();
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
};
const toDate = (value) => {
    if (!value)
        return undefined;
    const date = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(date.getTime()) ? undefined : date;
};
const computeAge = (dob) => {
    if (!dob)
        return undefined;
    const birth = toDate(dob);
    if (!birth)
        return undefined;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age;
};
const computeBmi = (weightKg, heightCm) => {
    if (!weightKg || !heightCm)
        return undefined;
    if (heightCm <= 0)
        return undefined;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Number.isFinite(bmi) ? Math.round(bmi * 10) / 10 : undefined;
};
const selectMostRecent = (items, fields) => {
    if (!items.length)
        return undefined;
    let latest = items[0];
    let latestTime = -Infinity;
    items.forEach((item) => {
        const timestamps = fields
            .map((field) => toDate(item[field]))
            .filter((value) => Boolean(value));
        if (!timestamps.length && item.createdAt) {
            const created = toDate(item.createdAt);
            if (created)
                timestamps.push(created);
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
const normalizeSeverity = (value) => value?.trim().toLowerCase();
const normalizePriority = (value) => {
    const normalized = value?.trim().toLowerCase();
    if (!normalized)
        return "Info";
    if (normalized === "high")
        return "High";
    if (normalized === "medium")
        return "Medium";
    if (normalized === "low")
        return "Low";
    return "Info";
};
const buildRiskLevel = (riskScore) => {
    if (riskScore >= 70)
        return "High";
    if (riskScore >= 40)
        return "Medium";
    return "Low";
};
const computeRiskScore = (signals) => {
    let score = 0;
    const factors = [];
    if (typeof signals.age === "number") {
        if (signals.age >= 65) {
            score += 15;
            factors.push("Age 65+");
        }
        else if (signals.age >= 50) {
            score += 10;
            factors.push("Age 50-64");
        }
        else if (signals.age >= 35) {
            score += 5;
            factors.push("Age 35-49");
        }
    }
    if (typeof signals.systolicBp === "number" &&
        typeof signals.diastolicBp === "number") {
        const systolic = signals.systolicBp;
        const diastolic = signals.diastolicBp;
        if (systolic >= 160 || diastolic >= 100) {
            score += 20;
            factors.push("Very high blood pressure");
        }
        else if (systolic >= 140 || diastolic >= 90) {
            score += 15;
            factors.push("High blood pressure");
        }
        else if (systolic >= 130 || diastolic >= 80) {
            score += 10;
            factors.push("Elevated blood pressure");
        }
        else if (systolic < 90 || diastolic < 60) {
            score += 8;
            factors.push("Low blood pressure");
        }
    }
    if (typeof signals.heartRate === "number") {
        if (signals.heartRate > 100 || signals.heartRate < 50) {
            score += 10;
            factors.push("Abnormal heart rate");
        }
        else if (signals.heartRate >= 90) {
            score += 5;
            factors.push("Elevated heart rate");
        }
    }
    if (typeof signals.glucoseLevel === "number") {
        if (signals.glucoseLevel >= 200) {
            score += 20;
            factors.push("Very high glucose");
        }
        else if (signals.glucoseLevel >= 126) {
            score += 12;
            factors.push("High glucose");
        }
        else if (signals.glucoseLevel >= 100) {
            score += 5;
            factors.push("Borderline glucose");
        }
        else if (signals.glucoseLevel < 70) {
            score += 8;
            factors.push("Low glucose");
        }
    }
    if (typeof signals.bmi === "number") {
        if (signals.bmi >= 35) {
            score += 15;
            factors.push("Severe obesity");
        }
        else if (signals.bmi >= 30) {
            score += 10;
            factors.push("Obesity");
        }
        else if (signals.bmi >= 25) {
            score += 5;
            factors.push("Overweight");
        }
        else if (signals.bmi < 18.5) {
            score += 5;
            factors.push("Underweight");
        }
    }
    if (typeof signals.symptomCount === "number") {
        if (signals.symptomCount >= 6) {
            score += 10;
            factors.push("Many symptoms");
        }
        else if (signals.symptomCount >= 3) {
            score += 5;
            factors.push("Multiple symptoms");
        }
    }
    if (typeof signals.symptomDurationDays === "number") {
        if (signals.symptomDurationDays >= 30) {
            score += 10;
            factors.push("Symptoms for 30+ days");
        }
        else if (signals.symptomDurationDays >= 14) {
            score += 5;
            factors.push("Symptoms for 14+ days");
        }
    }
    if (signals.symptomSeverity) {
        const severity = normalizeSeverity(signals.symptomSeverity);
        if (severity === "severe") {
            score += 15;
            factors.push("Severe symptoms");
        }
        else if (severity === "moderate") {
            score += 8;
            factors.push("Moderate symptoms");
        }
        else if (severity === "mild") {
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
            }
            else if (labValue >= 5.7) {
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
const computeVaidyaScore = (riskScore, signals) => {
    let bonus = 0;
    if (typeof signals.systolicBp === "number" &&
        typeof signals.diastolicBp === "number" &&
        signals.systolicBp < 130 &&
        signals.diastolicBp < 80) {
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
const computeConfidence = (signals, latestDates) => {
    const totalSignals = 8;
    let present = 0;
    if (typeof signals.age === "number")
        present += 1;
    if (typeof signals.systolicBp === "number")
        present += 1;
    if (typeof signals.diastolicBp === "number")
        present += 1;
    if (typeof signals.glucoseLevel === "number")
        present += 1;
    if (typeof signals.heartRate === "number")
        present += 1;
    if (typeof signals.bmi === "number")
        present += 1;
    if (typeof signals.symptomCount === "number")
        present += 1;
    if (signals.symptomSeverity)
        present += 1;
    const completeness = present / totalSignals;
    let confidence = 0.35 + completeness * 0.6;
    const now = Date.now();
    const mostRecent = latestDates.length
        ? Math.max(...latestDates.map((date) => date.getTime()))
        : 0;
    if (mostRecent > 0) {
        const days = (now - mostRecent) / (1000 * 60 * 60 * 24);
        if (days > 365)
            confidence -= 0.2;
        else if (days > 180)
            confidence -= 0.1;
    }
    return clamp(Math.round(confidence * 100) / 100, 0.2, 0.95);
};
const extractJson = (value) => {
    const trimmed = value.trim();
    if (!trimmed)
        return null;
    try {
        return JSON.parse(trimmed);
    }
    catch {
        const start = trimmed.indexOf("{");
        const end = trimmed.lastIndexOf("}");
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(trimmed.slice(start, end + 1));
            }
            catch {
                return null;
            }
        }
        return null;
    }
};
const geminiEndpoint = process.env.GEMINI_API_URL ??
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const buildRiskPrompt = (params) => {
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
const callGemini = async (prompt, useSchema) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        throw new Error("Missing GEMINI_API_KEY");
    const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const generationConfig = {
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
            throw new Error(`Gemini error: ${response.status} ${response.statusText} ${errorText}`);
        }
        const data = (await response.json());
        return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
    finally {
        clearTimeout(timeout);
    }
};
const generateAiInsights = async (prompt) => {
    const useSchema = process.env.GEMINI_USE_JSON_SCHEMA !== "false";
    try {
        const text = await callGemini(prompt, useSchema);
        const parsed = extractJson(text);
        return parsed ?? null;
    }
    catch (error) {
        if (useSchema) {
            try {
                const text = await callGemini(prompt, false);
                const parsed = extractJson(text);
                return parsed ?? null;
            }
            catch {
                return null;
            }
        }
        return null;
    }
};
const buildRuleBasedInsights = (signals, riskLevel) => {
    const insights = [];
    if (typeof signals.systolicBp === "number" &&
        typeof signals.diastolicBp === "number") {
        if (signals.systolicBp >= 140 || signals.diastolicBp >= 90) {
            insights.push({
                title: "Blood pressure elevated",
                description: "Recent blood pressure readings are elevated. Consider monitoring and discussing with a clinician.",
                priority: "High",
            });
        }
        else if (signals.systolicBp >= 130 || signals.diastolicBp >= 80) {
            insights.push({
                title: "Blood pressure trending up",
                description: "Blood pressure is slightly elevated. Track trends and lifestyle factors.",
                priority: "Medium",
            });
        }
    }
    if (typeof signals.glucoseLevel === "number") {
        if (signals.glucoseLevel >= 126) {
            insights.push({
                title: "Glucose elevated",
                description: "Glucose values are above typical range. Consider follow-up testing and clinician review.",
                priority: "High",
            });
        }
        else if (signals.glucoseLevel >= 100) {
            insights.push({
                title: "Glucose borderline",
                description: "Glucose is on the higher side. Monitor diet, activity, and trends.",
                priority: "Medium",
            });
        }
    }
    if (typeof signals.bmi === "number") {
        if (signals.bmi >= 30) {
            insights.push({
                title: "BMI indicates obesity",
                description: "BMI is in the obesity range. A gradual, clinician-guided plan may help reduce risk.",
                priority: "Medium",
            });
        }
        else if (signals.bmi >= 25) {
            insights.push({
                title: "BMI indicates overweight",
                description: "BMI is above the typical range. Nutrition and activity improvements may help.",
                priority: "Low",
            });
        }
        else if (signals.bmi < 18.5) {
            insights.push({
                title: "BMI indicates underweight",
                description: "BMI is below the typical range. Consider discussing nutrition goals with a clinician.",
                priority: "Low",
            });
        }
    }
    if (signals.symptomCount && signals.symptomCount >= 3) {
        insights.push({
            title: "Multiple symptoms reported",
            description: "Several symptoms are present. Track changes and consult if they persist.",
            priority: "Medium",
        });
    }
    if (!insights.length) {
        insights.push({
            title: "No major risk signals",
            description: "Recent data does not show major risk signals. Continue regular monitoring.",
            priority: "Info",
        });
    }
    if (riskLevel === "High") {
        insights.unshift({
            title: "High risk level",
            description: "Overall risk score is high. Consider scheduling a clinical review soon.",
            priority: "High",
        });
    }
    return insights;
};
const inferConditionFromSignals = (signals) => {
    if (typeof signals.systolicBp === "number" &&
        typeof signals.diastolicBp === "number" &&
        (signals.systolicBp >= 140 || signals.diastolicBp >= 90)) {
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
const buildMedicationConditions = (medications) => {
    if (!medications)
        return [];
    const values = [medications.diagnosis, medications.disease, medications.purpose]
        .filter(Boolean)
        .map((value) => String(value));
    return values.length ? values : [];
};
const pickVitals = (vitalsList, userData) => {
    const latest = selectMostRecent(vitalsList, ["recordedAt"]);
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
    if (!latest)
        return undefined;
    const createdAt = latest.createdAt;
    return {
        systolicBp: latest.systolicBp,
        diastolicBp: latest.diastolicBp,
        glucoseLevel: latest.glucoseLevel,
        heartRate: latest.heartRate,
        weight: latest.weight ?? userData?.weightKg,
        height: latest.height ?? userData?.heightCm,
        bmi: latest.bmi,
        recordedAt: latest.recordedAt ?? createdAt,
    };
};
const pickSymptoms = (symptomsList) => {
    const latest = selectMostRecent(symptomsList, ["loggedAt"]);
    if (!latest)
        return undefined;
    const createdAt = latest.createdAt;
    return {
        symptomList: latest.symptomList ?? [],
        severity: latest.severity,
        durationDays: latest.durationDays,
        loggedAt: latest.loggedAt ?? createdAt,
    };
};
const pickLabTest = (labTest) => {
    if (!labTest)
        return undefined;
    const createdAt = labTest.createdAt;
    return {
        testName: labTest.testName,
        resultValue: labTest.resultValue,
        unit: labTest.unit,
        testedDate: labTest.testedDate ?? createdAt,
    };
};
class RiskAssessmentService {
    async generateAssessment(userId, payload) {
        const { vitalsIds, symptomsIds, maxInsights, notes, includeAi, reportId } = payload;
        const shouldUseLatest = payload.useLatest ?? true;
        const [userData, latestLabTest, latestMedication] = await Promise.all([
            userDataRepository.getByUserId(userId),
            labTestRepository.getLatestForUser(userId),
            medicationsRepository.getLatestForUser(userId),
        ]);
        const vitalsList = vitalsIds?.length
            ? (await Promise.all(vitalsIds.map((id) => vitalsRepository.getForUser(id, userId)))).filter((item) => Boolean(item))
            : shouldUseLatest
                ? [await vitalsRepository.getLatestForUser(userId)].filter((item) => Boolean(item))
                : [];
        const symptomsList = symptomsIds?.length
            ? (await Promise.all(symptomsIds.map((id) => symptomsRepository.getForUser(id, userId)))).filter((item) => Boolean(item))
            : shouldUseLatest
                ? [await symptomsRepository.getLatestForUser(userId)].filter((item) => Boolean(item))
                : [];
        const vitalsSnapshot = pickVitals(vitalsList, userData);
        const symptomsSnapshot = pickSymptoms(symptomsList);
        const labSnapshot = pickLabTest(latestLabTest);
        const age = computeAge(userData?.dob);
        const bmi = vitalsSnapshot?.bmi ??
            computeBmi(vitalsSnapshot?.weight, vitalsSnapshot?.height);
        const signals = {
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
        const latestDates = [];
        if (vitalsSnapshot?.recordedAt) {
            const date = toDate(vitalsSnapshot.recordedAt);
            if (date)
                latestDates.push(date);
        }
        if (symptomsSnapshot?.loggedAt) {
            const date = toDate(symptomsSnapshot.loggedAt);
            if (date)
                latestDates.push(date);
        }
        if (labSnapshot?.testedDate) {
            const date = toDate(labSnapshot.testedDate);
            if (date)
                latestDates.push(date);
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
        const predictedCondition = aiResponse?.predicted_condition?.trim() ||
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
            await riskVitalsRepository.createMany(vitalsList.map((vitals) => ({
                riskId: riskAssessment._id,
                vitalsId: vitals._id,
            })));
        }
        if (symptomsList.length) {
            await riskSymptomsRepository.createMany(symptomsList.map((symptoms) => ({
                riskId: riskAssessment._id,
                symptomsId: symptoms._id,
            })));
        }
        const fallbackInsights = buildRuleBasedInsights(signals, riskLevel);
        const insightsPayload = (aiInsights.length ? aiInsights : fallbackInsights)
            .slice(0, insightLimit)
            .map((insight) => ({
            userId,
            insightTitle: "insight_title" in insight ? insight.insight_title : insight.title,
            description: insight.description,
            priority: normalizePriority(insight.priority),
            generatedFromRisk: String(riskAssessment._id),
        }));
        const createdInsights = await healthInsightRepository.createMany(insightsPayload);
        if (reportId &&
            createdInsights.length &&
            mongoose_1.default.Types.ObjectId.isValid(reportId)) {
            const reportObjectId = new mongoose_1.default.Types.ObjectId(reportId);
            await reportInsightRepository.createMany(createdInsights.map((insight) => ({
                reportId: reportObjectId,
                insightId: insight._id,
            })));
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
    async getAssessments(userId) {
        return riskAssessmentRepository.getAllForUser(userId);
    }
    async getAssessmentById(userId, riskId) {
        const assessment = await riskAssessmentRepository.getForUser(riskId, userId);
        if (!assessment)
            throw new apiError_1.default(404, "Risk assessment not found");
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
exports.RiskAssessmentService = RiskAssessmentService;
