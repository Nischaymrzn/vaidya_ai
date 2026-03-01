export type AiModuleCategory =
  | "Prediction"
  | "Assistant"
  | "Analysis"
  | "Scan";

export type AiModuleCatalogItem = {
  id: string;
  name: string;
  category: AiModuleCategory;
  scope: string;
  clientPath: string;
  apiPath: string;
  description: string;
  defaultVersion: string;
  defaultActive: boolean;
};

export type AiDoctorCatalogItem = {
  id: string;
  name: string;
  title: string;
  specialty: string;
  tags: string[];
  image: string;
  defaultActive: boolean;
};

export const AI_MODULE_CATALOG: AiModuleCatalogItem[] = [
  {
    id: "symptom-disease-predictor",
    name: "Symptom Disease Predictor",
    category: "Prediction",
    scope: "General",
    clientPath: "/symptoms/anomalies",
    apiPath: "/predict/symptom",
    description: "Predicts likely diseases from selected symptom patterns.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
  {
    id: "heart-disease-predictor",
    name: "Heart Disease Predictor",
    category: "Prediction",
    scope: "Cardiology",
    clientPath: "/health-intelligence/predictions/heart-disease",
    apiPath: "/predict/heart-disease",
    description: "Estimates heart disease probability using clinical markers.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
  {
    id: "diabetes-predictor",
    name: "Diabetes Predictor",
    category: "Prediction",
    scope: "Endocrinology",
    clientPath: "/health-intelligence/predictions/diabetes",
    apiPath: "/predict/diabetes",
    description: "Estimates diabetes risk using metabolic indicators.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
  {
    id: "tuberculosis-predictor",
    name: "Tuberculosis Predictor",
    category: "Prediction",
    scope: "Respiratory",
    clientPath: "/health-intelligence/predictions/tuberculosis",
    apiPath: "/predict/tuberculosis",
    description: "Classifies chest image signals into TB vs Normal.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
  {
    id: "brain-tumor-predictor",
    name: "Brain Tumor Predictor",
    category: "Prediction",
    scope: "Neurology",
    clientPath: "/health-intelligence/predictions/brain-tumor",
    apiPath: "/predict/brain-tumor",
    description: "Classifies MRI patterns for brain tumor screening.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
  {
    id: "risk-analysis-engine",
    name: "Risk Analysis Engine",
    category: "Analysis",
    scope: "Population Risk",
    clientPath: "/health-intelligence/risk-analysis",
    apiPath: "/risk-assessments/generate",
    description: "Aggregates patient history and creates multi-factor risk analysis.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
  {
    id: "ai-assistant-chat",
    name: "AI Assistant Chat",
    category: "Assistant",
    scope: "Guidance",
    clientPath: "/ai-assistant",
    apiPath: "/ai-chat",
    description: "Conversational assistant for health and medical queries.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
  {
    id: "medical-scan-parser",
    name: "Medical Scan Parser",
    category: "Scan",
    scope: "Records",
    clientPath: "/medical-files",
    apiPath: "/ai-scan",
    description: "Extracts structured data from medical images and reports.",
    defaultVersion: "1.0.0",
    defaultActive: true,
  },
];

export const AI_DOCTOR_CATALOG: AiDoctorCatalogItem[] = [
  {
    id: "nischay-maharan",
    name: "Dr. Nischay Maharan",
    title: "General Physician AI",
    specialty: "Primary Care",
    tags: [
      "Primary Care",
      "Symptom Evaluation",
      "Preventive Health",
      "Vital Review",
      "Risk Assessment",
    ],
    image: "/doctor.png",
    defaultActive: true,
  },
  {
    id: "trishan-wagle",
    name: "Dr. Trishan Wagle",
    title: "Cardiology AI Specialist",
    specialty: "Cardiology",
    tags: [
      "Heart Health",
      "Blood Pressure Monitoring",
      "Cholesterol Analysis",
      "Cardiac Risk",
      "ECG Guidance",
    ],
    image: "/doctor_2.webp",
    defaultActive: true,
  },
  {
    id: "albert-maharan",
    name: "Dr. Albert Maharan",
    title: "Endocrinology AI Specialist",
    specialty: "Endocrinology",
    tags: [
      "Diabetes Care",
      "Glucose Tracking",
      "Thyroid Health",
      "Hormonal Balance",
      "Metabolic Risk",
    ],
    image: "/doctor.png",
    defaultActive: true,
  },
  {
    id: "rabin-tamang",
    name: "Dr. Rabin Tamang",
    title: "Mental Wellness AI Specialist",
    specialty: "Mental Wellness",
    tags: [
      "Stress Management",
      "Anxiety Support",
      "Mood Tracking",
      "Sleep Health",
      "Behavioral Insights",
    ],
    image: "/doctor_2.webp",
    defaultActive: true,
  },
  {
    id: "kiran-rana",
    name: "Dr. Kiran Rana",
    title: "Respiratory Health AI Specialist",
    specialty: "Respiratory",
    tags: [
      "Lung Function",
      "Breathing Assessment",
      "Oxygen Monitoring",
      "Infection Screening",
      "Asthma Care",
    ],
    image: "/doctor.png",
    defaultActive: true,
  },
];
