export type DashboardVitalPoint = {
  day: string;
  heartRate: number | null;
  systolic: number | null;
  glucose: number | null;
};

export type DashboardHealthScorePoint = {
  day: string;
  score: number;
};

export type DashboardSymptomPoint = {
  name: string;
  frequency: number;
};

export type DashboardMedicationItem = {
  name: string;
  dose: string;
  adherence: number;
  meta?: string;
};

export type DashboardTimelineItem = {
  date: string;
  title: string;
  meta: string;
};

export type DashboardRiskFactor = {
  label: string;
  level: string;
  score: number;
};

export type DashboardInsight = {
  title: string;
  body: string;
};

export type DashboardClinicalItem = {
  label: string;
  value: string;
  meta: string;
  bg: string;
};

export type DashboardSummaryCard = {
  title: string;
  value: string;
  note: string;
  dot: string;
  surface: string;
  border: string;
  valueClass: string;
  iconName: "clipboard" | "activity" | "alert";
  iconBg: string;
  iconRing: string;
  iconColor: string;
  titleClass?: string;
  noteClass?: string;
};

export type DashboardSummary = {
  userName: string;
  vaidyaScore?: number | null;
  summaryCards: DashboardSummaryCard[];
  vitalsData: DashboardVitalPoint[];
  vitalStats: { label: string; value: string; note: string }[];
  symptomData: DashboardSymptomPoint[];
  symptomPattern?: string;
  medications: DashboardMedicationItem[];
  allergies: string[];
  clinicalItems: DashboardClinicalItem[];
  riskFactors: DashboardRiskFactor[];
  insights: DashboardInsight[];
  timelineItems: DashboardTimelineItem[];
  healthScoreTrend: DashboardHealthScorePoint[];
};
