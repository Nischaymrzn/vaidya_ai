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
  isPremium?: boolean;
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
  diagnosisStatus?: "active" | "resolved" | "unknown";
  content?: string;
  notes?: string;
  status?: "Verified" | "Processed" | "Reviewed" | "Active";
  aiScanned?: boolean;
  structuredData?: Record<string, unknown>;
  attachments?: TMedicalRecordAttachment[];
  items?: { type: string; refId: string }[];
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
  analysis?: {
    summary?: string;
    demographics?: {
      name?: string;
      age?: number;
      gender?: string;
      bloodGroup?: string;
      heightCm?: number;
      weightKg?: number;
    };
    vitalsSnapshot?: {
      recordedAt?: string;
      systolicBp?: number;
      diastolicBp?: number;
      glucoseLevel?: number;
      heartRate?: number;
      bmi?: number;
      weight?: number;
      height?: number;
    };
    sections?: {
      vitals?: string;
      symptoms?: string;
      records?: string;
      medications?: string;
      allergies?: string;
      immunizations?: string;
    };
    keyFindings?: Array<{
      title: string;
      detail: string;
      priority?: "High" | "Medium" | "Low" | "Info";
    }>;
    dataGaps?: string[];
    recommendations?: string[];
    nextSteps?: string[];
    generatedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type TPredictionScore = {
  disease: string;
  probability: number;
};

export type TPredictionFinal = TPredictionScore & {
  explanation: string;
};

export type TPredictionResponse = {
  top10: TPredictionScore[];
  finalTop3: TPredictionFinal[];
  analysisSummary: string;
};

export type THeartDiseaseInsight = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | "Info";
};

export type TTuberculosisInsight = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | "Info";
};

export type THeartDiseasePredictionResponse = {
  prediction: number;
  probability: number;
  riskLevel: "Low" | "Moderate" | "High";
  probabilities: { label: number; probability: number }[];
  insights: THeartDiseaseInsight[];
};

export type TTuberculosisPredictionResponse = {
  prediction: string;
  probability: number;
  probabilities: { label: string; probability: number }[];
  riskLevel: "Low" | "Moderate" | "High";
  insights: TTuberculosisInsight[];
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
  recordId?: string;
  symptomList?: string[];
  severity?: string;
  status?: "ongoing" | "resolved" | "unknown";
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
  recordId?: string;
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
