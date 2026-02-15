import type {
  ClinicalItem,
  HealthScorePoint,
  InsightItem,
  MedicationItem,
  RiskFactor,
  SummaryCard,
  SymptomDataPoint,
  TimelineItem,
  VitalDataPoint,
} from "../app/(protected)/dashboard/_components/types";

export const vitalsData: VitalDataPoint[] = [
  { day: "Mon", heartRate: 72, systolic: 128, glucose: 96 },
  { day: "Tue", heartRate: 84, systolic: 110, glucose: 107 },
  { day: "Wed", heartRate: 70, systolic: 118, glucose: 98 },
  { day: "Thu", heartRate: 76, systolic: 121, glucose: 104 },
  { day: "Fri", heartRate: 73, systolic: 119, glucose: 99 },
  { day: "Sat", heartRate: 68, systolic: 123, glucose: 107 },
  { day: "Sun", heartRate: 75, systolic: 120, glucose: 102 },
];

export const healthScoreTrend: HealthScorePoint[] = [
  { day: "Mon", score: 68 },
  { day: "Tue", score: 80 },
  { day: "Wed", score: 69 },
  { day: "Thu", score: 86 },
  { day: "Fri", score: 73 },
  { day: "Sat", score: 82 },
  { day: "Sun", score: 84 },
];

export const symptomData: SymptomDataPoint[] = [
  { name: "Fatigue", frequency: 68 },
  { name: "Headache", frequency: 52 },
  { name: "Joint Pain", frequency: 44 },
  { name: "Sleep Issues", frequency: 36 },
  { name: "Dizziness", frequency: 18 },
];

export const medications: MedicationItem[] = [
  { name: "Pantop", dose: "40mg", adherence: 94 },
  { name: "Sinex", dose: "10mg", adherence: 88 },
  { name: "Cetamol", dose: "500mg", adherence: 86 },
];

export const allergies: string[] = ["Peanuts", "Penicillin", "Dust mites"];

export const timelineItems: TimelineItem[] = [
  { date: "Feb 6", title: "Vitals Logged", meta: "BP, HR, SpO2" },
  { date: "Feb 2", title: "Symptom Update", meta: "Headache, fatigue" },
  { date: "Jan 29", title: "Prescription Renewed", meta: "Amlodipine 5mg" },
];

export const riskFactors: RiskFactor[] = [
  { label: "Cardiovascular", level: "Low", score: 22 },
  { label: "Diabetes Type 2", level: "Moderate", score: 45 },
  { label: "Respiratory", level: "Low", score: 12 },
];

export const aiInsights: InsightItem[] = [
  {
    title: "Blood Pressure Trend",
    body: "BP is stable this week with mild variability.",
  },
  {
    title: "Symptom Pattern",
    body: "Fatigue clusters mid-week after late nights.",
  },
];

export const clinicalItems: ClinicalItem[] = [
  {
    label: "Active Diagnosis",
    value: "Mild Hypertension, Pre-diabetes",
    meta: "Last reviewed Dec 12, 2025",
    bg: "bg-white",
  },
  {
    label: "Recent Lab Work",
    value: "CBC, Lipid Panel, HbA1c",
    meta: "Jan 15, 2026",
    bg: "bg-white",
  },
  {
    label: "Records Uploaded",
    value: "3 new this month",
    meta: "ECG, Lab report, Prescription",
    bg: "bg-white",
  },
];

export const HEALTH_SCORE = 82;

export const CHART_COLORS = {
  heartRate: "#1F7AE0",
  systolic: "#1F7AE0",
  glucose: "#1F7AE0",
};

export const summaryCards: SummaryCard[] = [
  {
    title: "Health Records",
    value: "3 uploaded",
    note: "ECG, Lab report, Prescription",
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
    value: "3 ongoing",
    note: "Last updated Feb 2",
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
    value: "3 listed",
    note: "Peanuts, Penicillin, Dust mites",
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
