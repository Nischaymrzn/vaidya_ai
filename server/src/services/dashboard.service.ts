import { AllergyRepository } from "../repositories/allergy.repository";
import { HealthInsightRepository } from "../repositories/health-insight.repository";
import { LabTestRepository } from "../repositories/lab-test.repository";
import { MedicalRecordRepository } from "../repositories/medical-record.repository";
import { MedicationsRepository } from "../repositories/medications.repository";
import { RiskAssessmentRepository } from "../repositories/risk-assessment.repository";
import { SymptomsRepository } from "../repositories/symptoms.repository";
import { VitalsRepository } from "../repositories/vitals.repository";
import { RiskAssessmentService } from "./risk-assessment.service";
import type { AllergyDb } from "../models/allergy.model";
import type { LabTestDb } from "../models/lab-test.model";
import type { MedicationsDb } from "../models/medications.model";
import type { MedicalRecordDb } from "../models/medical-record.model";
import type { SymptomsDb } from "../models/symptoms.model";
import type { VitalsDb } from "../models/vitals.model";
import type {
  DashboardClinicalItem,
  DashboardHealthScorePoint,
  DashboardInsight,
  DashboardMedicationItem,
  DashboardRiskFactor,
  DashboardSummary,
  DashboardSummaryCard,
  DashboardSymptomPoint,
  DashboardTimelineItem,
  DashboardVitalPoint,
} from "../types/dashboard.types";

const vitalsRepository = new VitalsRepository();
const symptomsRepository = new SymptomsRepository();
const medicationsRepository = new MedicationsRepository();
const labTestRepository = new LabTestRepository();
const allergyRepository = new AllergyRepository();
const medicalRecordRepository = new MedicalRecordRepository();
const riskAssessmentRepository = new RiskAssessmentRepository();
const healthInsightRepository = new HealthInsightRepository();
const riskAssessmentService = new RiskAssessmentService();

const toDate = (value?: unknown) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const toTimestamp = (value?: unknown) => {
  const date = toDate(value);
  return date ? date.getTime() : 0;
};

const pickTimestamp = (item: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const raw = item[field];
    if (typeof raw === "string" || raw instanceof Date) {
      const ts = toTimestamp(raw);
      if (ts) return ts;
    }
  }
  return 0;
};

const formatShortDate = (value?: string | Date | null) => {
  const date = value instanceof Date ? value : toDate(value);
  return date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "--";
};

const formatSignedDelta = (value: number | null, suffix = "") =>
  value === null ? "N/A" : `${value > 0 ? "+" : ""}${value}${suffix}`;

type LatestDelta = {
  current: number | null;
  previous: number | null;
  change: number | null;
  currentDate: Date | null;
  previousDate: Date | null;
};

const getLatestDelta = <T,>(
  items: T[],
  getValue: (item: T) => number | undefined,
  getDate: (item: T) => Date | null,
): LatestDelta => {
  let current: number | undefined;
  let previous: number | undefined;
  let currentDate: Date | null = null;
  let previousDate: Date | null = null;

  for (let i = items.length - 1; i >= 0; i -= 1) {
    const value = getValue(items[i]);
    if (typeof value !== "number") continue;
    if (current === undefined) {
      current = value;
      currentDate = getDate(items[i]);
      continue;
    }
    previous = value;
    previousDate = getDate(items[i]);
    break;
  }

  return {
    current: current ?? null,
    previous: previous ?? null,
    change:
      current !== undefined && previous !== undefined ? current - previous : null,
    currentDate,
    previousDate,
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

const buildRiskLevel = (score: number) => {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
};

const getItemDate = (item: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const date = toDate(item[field]);
    if (date) return date;
  }
  return null;
};

export class DashboardService {
  async getSummary(userId: string, userName: string): Promise<DashboardSummary> {
    const [
      vitals,
      symptoms,
      medications,
      labTests,
      allergies,
      medicalRecordsResult,
      assessmentsResult,
    ] = await Promise.all([
      vitalsRepository.getAllForUser(userId),
      symptomsRepository.getAllForUser(userId),
      medicationsRepository.getAllForUser(userId),
      labTestRepository.getAllForUser(userId),
      allergyRepository.getAllForUser(userId),
      medicalRecordRepository.getAllForUser(userId, { page: 1, limit: 30 }),
      riskAssessmentRepository.getAllForUser(userId),
    ]);

    let assessments = assessmentsResult ?? [];
    let latestAssessment = assessments[0];

    const generated = await riskAssessmentService.generateAssessment(userId, {
      useLatest: true,
      includeAi: false,
      maxInsights: 2,
    });

    if (generated?.assessment) {
      const generatedId = String(generated.assessment._id);
      if (!latestAssessment || String(latestAssessment._id) !== generatedId) {
        assessments = [
          generated.assessment,
          ...assessments.filter((item) => String(item._id) !== generatedId),
        ];
        latestAssessment = generated.assessment;
      }
    }

    const insightsData = generated?.insights?.length
      ? generated.insights
      : latestAssessment
        ? await healthInsightRepository.getAllForUser(
            userId,
            String(latestAssessment._id),
          )
        : [];

    const sortedVitals = [...vitals].sort(
      (a, b) =>
        pickTimestamp(b as Record<string, unknown>, [
          "recordedAt",
          "createdAt",
        ]) -
        pickTimestamp(a as Record<string, unknown>, [
          "recordedAt",
          "createdAt",
        ]),
    );

    const sortedVitalsAsc = [...sortedVitals].reverse();
    const trendVitals = sortedVitalsAsc.filter(
      (vital) =>
        typeof vital.heartRate === "number" ||
        typeof vital.systolicBp === "number" ||
        typeof vital.glucoseLevel === "number",
    );

    const getVitalDate = (vital: VitalsDb) =>
      toDate(vital.recordedAt ?? (vital as { createdAt?: Date }).createdAt);

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

    const vitalsData: DashboardVitalPoint[] = Array.from(
      { length: maxPoints },
      (_, index) => ({
        day: index === 0 ? "Start" : index === maxPoints - 1 ? "Latest" : "",
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

    const bpCurrent =
      systolicDelta.current !== null && diastolicDelta.current !== null
        ? `${systolicDelta.current}/${diastolicDelta.current}`
        : systolicDelta.current !== null
          ? `${systolicDelta.current} (systolic)`
          : diastolicDelta.current !== null
            ? `${diastolicDelta.current} (diastolic)`
            : "N/A";

    const bpDeltaValue =
      systolicDelta.change !== null && diastolicDelta.change !== null
        ? `${formatSignedDelta(systolicDelta.change, " mmHg")} / ${formatSignedDelta(
            diastolicDelta.change,
            " mmHg",
          )}`
        : systolicDelta.change !== null
          ? `${formatSignedDelta(systolicDelta.change, " mmHg")} (systolic)`
          : diastolicDelta.change !== null
            ? `${formatSignedDelta(diastolicDelta.change, " mmHg")} (diastolic)`
            : "No previous reading";

    const vitalStats = [
      {
        label: "Heart Rate",
        value:
          heartRateDelta.current !== null
            ? `${heartRateDelta.current} bpm`
            : "N/A",
        note:
          heartRateDelta.change !== null
            ? formatSignedDelta(heartRateDelta.change, " bpm")
            : "No previous reading",
      },
      {
        label: "Blood Pressure",
        value: bpCurrent,
        note: bpDeltaValue,
      },
      {
        label: "Glucose",
        value:
          glucoseDelta.current !== null
            ? `${glucoseDelta.current} mg/dL`
            : "N/A",
        note:
          glucoseDelta.change !== null
            ? formatSignedDelta(glucoseDelta.change, " mg/dL")
            : "No previous reading",
      },
    ];

    const symptomCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const symptomCounts = new Map<string, number>();
    symptoms.forEach((entry) => {
      const ts = pickTimestamp(entry as Record<string, unknown>, [
        "loggedAt",
        "createdAt",
      ]);
      if (ts && ts < symptomCutoff) return;
      (entry.symptomList ?? []).forEach((symptom) => {
        const key = String(symptom).trim();
        if (!key) return;
        symptomCounts.set(key, (symptomCounts.get(key) ?? 0) + 1);
      });
    });

    const symptomData: DashboardSymptomPoint[] = Array.from(
      symptomCounts.entries(),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, frequency]) => ({ name, frequency }));

    const topSymptom = symptomData[0]?.name;
    const symptomPattern = topSymptom
      ? `${topSymptom} appears most frequently in the last 30 days.`
      : "No symptom pattern detected yet.";

    const medicationItems: DashboardMedicationItem[] = [...medications]
      .sort(
        (a, b) =>
          pickTimestamp(b as Record<string, unknown>, [
            "startDate",
            "createdAt",
          ]) -
          pickTimestamp(a as Record<string, unknown>, [
            "startDate",
            "createdAt",
          ]),
      )
      .slice(0, 4)
      .map((medication: MedicationsDb) => ({
        name: medication.medicineName,
        dose: medication.dosage ?? "--",
        adherence: 0,
        meta:
          medication.purpose ||
          medication.diagnosis ||
          medication.disease ||
          undefined,
      }));

    const allergyItems = allergies
      .filter((item: AllergyDb) => item.status !== "resolved")
      .map((item: AllergyDb) => item.allergen);

    const latestLab = [...labTests].sort(
      (a, b) =>
        pickTimestamp(b as Record<string, unknown>, [
          "testedDate",
          "createdAt",
        ]) -
        pickTimestamp(a as Record<string, unknown>, [
          "testedDate",
          "createdAt",
        ]),
    )[0];

    const diagnosisRecord = [...medicalRecordsResult.data].find(
      (record: MedicalRecordDb) => record.diagnosis,
    );

    const recordsThisMonth = medicalRecordsResult.data.filter(
      (record: MedicalRecordDb) => {
        const date = getItemDate(record as Record<string, unknown>, [
          "recordDate",
          "createdAt",
          "updatedAt",
        ]);
        if (!date) return false;
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      },
    ).length;

    const clinicalItems: DashboardClinicalItem[] = [
      {
        label: "Active Diagnosis",
        value: diagnosisRecord?.diagnosis || "No diagnosis recorded",
        meta: diagnosisRecord
          ? `Last reviewed ${formatShortDate(
              getItemDate(diagnosisRecord as Record<string, unknown>, [
                "updatedAt",
                "createdAt",
                "recordDate",
              ]),
            )}`
          : "Add a record to capture diagnosis",
        bg: "bg-white",
      },
      {
        label: "Recent Lab Work",
        value: latestLab ? latestLab.testName : "No lab tests recorded",
        meta: latestLab
          ? formatShortDate(
              getItemDate(latestLab as Record<string, unknown>, [
                "testedDate",
                "createdAt",
              ]),
            )
          : "Upload lab results to track",
        bg: "bg-white",
      },
      {
        label: "Records Uploaded",
        value: `${recordsThisMonth} this month`,
        meta: `${medicalRecordsResult.data.length} total records`,
        bg: "bg-white",
      },
    ];

    const latestSymptoms = [...symptoms].sort(
      (a, b) =>
        pickTimestamp(b as Record<string, unknown>, [
          "loggedAt",
          "createdAt",
        ]) -
        pickTimestamp(a as Record<string, unknown>, [
          "loggedAt",
          "createdAt",
        ]),
    )[0] as SymptomsDb | undefined;

    const summaryCards: DashboardSummaryCard[] = [
      {
        title: "Health Records",
        value: `${medicalRecordsResult.data.length} uploaded`,
        note: medicalRecordsResult.data.length
          ? `Last added ${formatShortDate(
              medicalRecordsResult.data[0]
                ? getItemDate(
                    medicalRecordsResult.data[0] as Record<string, unknown>,
                    ["recordDate", "createdAt", "updatedAt"],
                  )
                : null,
            )}`
          : "No records yet",
        dot: "bg-blue-500",
        surface: "bg-white",
        border: "border-slate-200/80",
        valueClass: "text-slate-900",
        iconName: "clipboard",
        iconBg: "bg-gray-100",
        iconRing: "ring-gray-100",
        iconColor: "text-gray-700",
      },
      {
        title: "Active Symptoms",
        value: `${latestSymptoms?.symptomList?.length ?? 0} ongoing`,
        note: latestSymptoms?.loggedAt
          ? `Last updated ${formatShortDate(latestSymptoms.loggedAt)}`
          : "No symptoms logged",
        dot: "bg-blue-500",
        surface: "bg-white",
        border: "border-slate-200/80",
        valueClass: "text-slate-900",
        iconName: "activity",
        iconBg: "bg-gray-100",
        iconRing: "ring-gray-100",
        iconColor: "text-gray-700",
      },
      {
        title: "Allergies",
        value: `${allergyItems.length} listed`,
        note: allergyItems.length
          ? allergyItems.slice(0, 3).join(", ")
          : "No allergies recorded",
        dot: "bg-blue-500",
        surface: "bg-white",
        border: "border-slate-200/80",
        valueClass: "text-slate-900",
        iconName: "alert",
        iconBg: "bg-gray-100",
        iconRing: "ring-gray-100",
        iconColor: "text-gray-700",
      },
    ];

    const latestVital = sortedVitals[0];
    const riskFactors: DashboardRiskFactor[] = [];

    if (latestVital?.systolicBp || latestVital?.diastolicBp) {
      const systolic = latestVital.systolicBp ?? 0;
      const diastolic = latestVital.diastolicBp ?? 0;
      let score = 20;
      if (systolic >= 160 || diastolic >= 100) score = 85;
      else if (systolic >= 140 || diastolic >= 90) score = 70;
      else if (systolic >= 130 || diastolic >= 80) score = 45;
      riskFactors.push({
        label: "Blood Pressure",
        level: buildRiskLevel(score),
        score,
      });
    }

    if (typeof latestVital?.glucoseLevel === "number") {
      const glucose = latestVital.glucoseLevel;
      let score = 20;
      if (glucose >= 200) score = 85;
      else if (glucose >= 126) score = 70;
      else if (glucose >= 100) score = 45;
      else if (glucose < 70) score = 60;
      riskFactors.push({
        label: "Glucose",
        level: buildRiskLevel(score),
        score,
      });
    }

    if (typeof latestVital?.bmi === "number") {
      const bmi = latestVital.bmi;
      let score = 15;
      if (bmi >= 35) score = 80;
      else if (bmi >= 30) score = 65;
      else if (bmi >= 25) score = 45;
      else if (bmi < 18.5) score = 45;
      riskFactors.push({
        label: "BMI",
        level: buildRiskLevel(score),
        score,
      });
    }

    if (!riskFactors.length && latestAssessment) {
      const score = Math.round(latestAssessment.riskScore ?? 0);
      riskFactors.push({
        label: latestAssessment.predictedCondition || "Overall risk",
        level: latestAssessment.riskLevel ?? buildRiskLevel(score),
        score,
      });
    }

    const insights: DashboardInsight[] = insightsData
      .slice(0, 2)
      .map((insight) => ({
        title: insight.insightTitle,
        body: insight.description,
      }));

    const timelineItems: DashboardTimelineItem[] = [
      ...medicalRecordsResult.data.map((record: MedicalRecordDb) => ({
        date: formatShortDate(
          getItemDate(record as Record<string, unknown>, [
            "recordDate",
            "createdAt",
            "updatedAt",
          ]),
        ),
        title: record.title || "Medical record",
        meta: record.recordType ?? record.category ?? "Record update",
        timestamp: pickTimestamp(record as Record<string, unknown>, [
          "createdAt",
          "recordDate",
        ]),
      })),
      ...sortedVitals.slice(0, 3).map((vital: VitalsDb) => ({
        date: formatShortDate(
          getItemDate(vital as Record<string, unknown>, [
            "recordedAt",
            "createdAt",
          ]),
        ),
        title: "Vitals logged",
        meta: `BP ${vital.systolicBp ?? "--"}/${
          vital.diastolicBp ?? "--"
        } | HR ${vital.heartRate ?? "--"}`,
        timestamp: pickTimestamp(vital as Record<string, unknown>, [
          "recordedAt",
          "createdAt",
        ]),
      })),
      ...symptoms.slice(0, 3).map((symptom: SymptomsDb) => ({
        date: formatShortDate(
          getItemDate(symptom as Record<string, unknown>, [
            "loggedAt",
            "createdAt",
          ]),
        ),
        title: "Symptoms updated",
        meta:
          (symptom.symptomList ?? []).slice(0, 3).join(", ") ||
          "Symptoms logged",
        timestamp: pickTimestamp(symptom as Record<string, unknown>, [
          "loggedAt",
          "createdAt",
        ]),
      })),
      ...labTests.slice(0, 2).map((lab: LabTestDb) => ({
        date: formatShortDate(
          getItemDate(lab as Record<string, unknown>, [
            "testedDate",
            "createdAt",
          ]),
        ),
        title: "Lab test recorded",
        meta: lab.testName,
        timestamp: pickTimestamp(lab as Record<string, unknown>, [
          "testedDate",
          "createdAt",
        ]),
      })),
    ]
      .filter((item) => item.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
      .map(({ timestamp, ...item }) => item);

    const assessmentScores = [...assessments]
      .filter((assessment) => typeof assessment.vaidyaScore === "number")
      .sort(
        (a, b) =>
          pickTimestamp(a as Record<string, unknown>, [
            "assessmentDate",
            "createdAt",
          ]) -
          pickTimestamp(b as Record<string, unknown>, [
            "assessmentDate",
            "createdAt",
          ]),
      );
    const recentAssessments = assessmentScores.slice(-7);
    const healthScoreTrend: DashboardHealthScorePoint[] = recentAssessments.map(
      (assessment) => {
        const date = getItemDate(assessment as Record<string, unknown>, [
          "assessmentDate",
          "createdAt",
        ]);
        return {
          day: date ? formatShortDate(date) : "Latest",
          score: Math.round(assessment.vaidyaScore ?? 0),
        };
      },
    );

    return {
      userName,
      vaidyaScore: latestAssessment?.vaidyaScore,
      summaryCards,
      vitalsData,
      vitalStats,
      symptomData,
      symptomPattern,
      medications: medicationItems,
      allergies: allergyItems,
      clinicalItems,
      riskFactors,
      insights,
      timelineItems,
      healthScoreTrend,
    };
  }
}
