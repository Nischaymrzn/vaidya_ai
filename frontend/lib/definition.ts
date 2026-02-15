export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export type TUser = {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: Role;
  number?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TMedicalRecordAttachment = {
  url: string;
  publicId?: string;
  type?: string;
  name?: string;
  size?: number;
};

export type TMedicalRecord = {
  _id: string;
  userId: string;
  title: string;
  recordType?: string;
  category?: string;
  provider?: string;
  recordDate?: string;
  visitType?: string;
  diagnosis?: string;
  content?: string;
  notes?: string;
  status?: "Verified" | "Processed" | "Reviewed" | "Active";
  aiScanned?: boolean;
  structuredData?: Record<string, unknown>;
  attachments?: TMedicalRecordAttachment[];
  createdAt?: string;
  updatedAt?: string;
};

export type TAllergy = {
  _id: string;
  userId: string;
  allergen: string;
  type?: "food" | "drug" | "environmental" | "other";
  reaction?: string;
  severity?: "mild" | "moderate" | "severe";
  status?: "active" | "resolved";
  onsetDate?: string;
  recordedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TImmunization = {
  _id: string;
  userId: string;
  vaccineName: string;
  date?: string;
  doseNumber?: number;
  series?: string;
  manufacturer?: string;
  lotNumber?: string;
  site?: string;
  route?: string;
  provider?: string;
  nextDue?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TNotification = {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read?: boolean;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TRiskAssessment = {
  _id: string;
  userId: string;
  predictedCondition?: string;
  riskLevel?: "Low" | "Medium" | "High";
  confidenceScore?: number;
  riskScore?: number;
  vaidyaScore?: number;
  assessmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TVitals = {
  _id: string;
  userId: string;
  systolicBp?: number;
  diastolicBp?: number;
  glucoseLevel?: number;
  heartRate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TSymptoms = {
  _id: string;
  userId: string;
  symptomList?: string[];
  severity?: string;
  durationDays?: number;
  diagnosis?: string;
  disease?: string;
  notes?: string;
  loggedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TMedication = {
  _id: string;
  userId: string;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  diagnosis?: string;
  disease?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TLabTest = {
  _id: string;
  userId: string;
  testName: string;
  resultValue?: string;
  normalRange?: string;
  unit?: string;
  testedDate?: string;
  reportFileId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type THealthInsight = {
  _id: string;
  userId: string;
  insightTitle: string;
  description: string;
  generatedFromRisk?: string;
  contextType?: string;
  contextHash?: string;
  priority?: "High" | "Medium" | "Low" | "Info";
  createdAt?: string;
  updatedAt?: string;
};

export type AnalyticsSummary = {
  dateRange: {
    start: string;
    end: string;
    months: number;
  };
  summary: {
    activeConditions: number;
    activeMedications: number;
    encounters: number;
    immunizations: number;
    notes: {
      recentConditions: number;
      medicationChanges: number;
      telehealthVisits: number;
      boostersDue: number;
    };
  };
  encounterTotals: {
    outpatient: number;
    telehealth: number;
    inpatient: number;
  };
  encounterHistory: {
    month: string;
    outpatient: number;
    telehealth: number;
    inpatient: number;
  }[];
  allergySeverity: {
    name: string;
    value: number;
  }[];
  topConditions: {
    name: string;
    count: number;
  }[];
  procedureBreakdown: {
    name: string;
    count: number;
  }[];
  medicationHistory: {
    month: string;
    active: number;
    new: number;
    stopped: number;
  }[];
  immunizationHistory: {
    month: string;
    routine: number;
    booster: number;
    travel: number;
  }[];
  providerNetwork: {
    activeProviders: number;
    referralsYtd: number;
    careTouchpoints: number;
    topProviders: {
      name: string;
      count: number;
    }[];
  };
};

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

export type VitalsSummaryCard = {
  key: "heartRate" | "bloodPressure" | "glucose" | "bmi";
  label: string;
  value: string;
  unit?: string;
  status: string;
  delta?: string | null;
  updatedAt?: string | null;
};

export type VitalsTrendPoint = {
  label: string;
  heartRate: number | null;
  systolic: number | null;
  glucose: number | null;
};

export type VitalsSummary = {
  cards: VitalsSummaryCard[];
  trend: VitalsTrendPoint[];
  records: TVitals[];
};
