export type HealthStatus = "stable" | "warning" | "critical"

export type VitalsSnapshot = {
  bp: string
  hr: string
  temp: string
  spo2: string
}

export type VitalsEntry = VitalsSnapshot & {
  date: string
  note: string
}

export type MedicalRecord = {
  id: string
  type: string
  date: string
  status: "reviewed" | "pending" | "follow-up"
}

export type AiConsultation = {
  id: string
  date: string
  doctor: string
  focus: string
  status: "completed" | "needs-follow-up"
}

export type FamilyMember = {
  id: string
  name: string
  age: number
  relation: string
  status: HealthStatus
  lastUpdated: string
  healthScore: number
  lastVitals: VitalsSnapshot
  conditions: string[]
  allergies: string[]
  medications: string[]
  records: MedicalRecord[]
  vitalsHistory: VitalsEntry[]
  aiConsultations: AiConsultation[]
}

export const statusMeta: Record<
  HealthStatus,
  { label: string; dot: string; badge: string; surface: string }
> = {
  stable: {
    label: "Stable",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
    surface: "bg-blue-50/70",
  },
  warning: {
    label: "Watch",
    dot: "bg-blue-300",
    badge: "bg-blue-50 text-blue-700",
    surface: "bg-blue-50/70",
  },
  critical: {
    label: "Critical",
    dot: "bg-blue-700",
    badge: "bg-blue-100 text-blue-900",
    surface: "bg-blue-50/70",
  },
}

export const familyMembers: FamilyMember[] = [
  {
    id: "nischay-maharjan",
    name: "Nischay Maharjan",
    age: 29,
    relation: "Self",
    status: "warning",
    lastUpdated: "Yesterday",
    healthScore: 72,
    lastVitals: { bp: "132/84", hr: "88", temp: "98.6 F", spo2: "96%" },
    conditions: ["Mild asthma"],
    allergies: ["Dust"],
    medications: ["Albuterol inhaler"],
    records: [
      { id: "rec-1", type: "Pulmonary function test", date: "Jan 28, 2026", status: "reviewed" },
      { id: "rec-2", type: "Chest X-ray", date: "Feb 14, 2026", status: "follow-up" },
    ],
    vitalsHistory: [
      { date: "Feb 17, 2026", bp: "132/84", hr: "88", temp: "98.6 F", spo2: "96%", note: "Evening check" },
      { date: "Feb 12, 2026", bp: "128/82", hr: "84", temp: "98.4 F", spo2: "97%", note: "Post work" },
      { date: "Feb 05, 2026", bp: "126/80", hr: "80", temp: "98.3 F", spo2: "98%", note: "Routine" },
    ],
    aiConsultations: [
      {
        id: "ai-1",
        date: "Feb 16, 2026",
        doctor: "Dr. Kiran Rana",
        focus: "Respiratory check-in",
        status: "needs-follow-up",
      },
    ],
  },
  {
    id: "anaya-maharjan",
    name: "Anaya Maharjan",
    age: 42,
    relation: "Mother",
    status: "stable",
    lastUpdated: "2 days ago",
    healthScore: 84,
    lastVitals: { bp: "118/76", hr: "72", temp: "98.2 F", spo2: "98%" },
    conditions: ["Hypertension", "Vitamin D deficiency"],
    allergies: ["Penicillin"],
    medications: ["Amlodipine 5mg", "Vitamin D3 1000 IU"],
    records: [
      { id: "rec-3", type: "Annual physical", date: "Jan 12, 2026", status: "reviewed" },
      { id: "rec-4", type: "Lipid panel", date: "Dec 02, 2025", status: "reviewed" },
    ],
    vitalsHistory: [
      { date: "Feb 15, 2026", bp: "118/76", hr: "72", temp: "98.2 F", spo2: "98%", note: "Morning check" },
      { date: "Feb 08, 2026", bp: "121/79", hr: "74", temp: "98.4 F", spo2: "97%", note: "Post walk" },
      { date: "Feb 01, 2026", bp: "116/75", hr: "70", temp: "98.1 F", spo2: "98%", note: "Routine" },
    ],
    aiConsultations: [
      {
        id: "ai-2",
        date: "Feb 10, 2026",
        doctor: "Dr. Nischay Maharan",
        focus: "BP stability and diet review",
        status: "completed",
      },
    ],
  },
  {
    id: "suresh-maharjan",
    name: "Suresh Maharjan",
    age: 54,
    relation: "Father",
    status: "critical",
    lastUpdated: "Today",
    healthScore: 62,
    lastVitals: { bp: "146/90", hr: "92", temp: "99.0 F", spo2: "94%" },
    conditions: ["Type 2 diabetes", "Hypertension"],
    allergies: ["Sulfa drugs"],
    medications: ["Metformin 500mg", "Losartan 50mg"],
    records: [
      { id: "rec-5", type: "HbA1c lab", date: "Feb 03, 2026", status: "pending" },
      { id: "rec-6", type: "Cardiology consult", date: "Jan 22, 2026", status: "follow-up" },
    ],
    vitalsHistory: [
      { date: "Feb 18, 2026", bp: "146/90", hr: "92", temp: "99.0 F", spo2: "94%", note: "Morning check" },
      { date: "Feb 13, 2026", bp: "142/88", hr: "90", temp: "98.8 F", spo2: "94%", note: "Post meal" },
      { date: "Feb 07, 2026", bp: "138/86", hr: "88", temp: "98.6 F", spo2: "95%", note: "Routine" },
    ],
    aiConsultations: [
      {
        id: "ai-3",
        date: "Feb 15, 2026",
        doctor: "Dr. Albert Maharan",
        focus: "Glucose trend review",
        status: "needs-follow-up",
      },
    ],
  },
]

export const familyAiInsights = [
  {
    id: "insight-1",
    title: "Respiratory stability",
    detail: "Self SpO2 has dipped by 2% across the last three check-ins.",
    action: "Schedule a follow-up if the dip continues.",
  },
  {
    id: "insight-2",
    title: "Blood pressure alignment",
    detail: "Mother readings remain within target for the last 30 days.",
    action: "Maintain current medication and logging cadence.",
  },
  {
    id: "insight-3",
    title: "Metabolic focus",
    detail: "Father HbA1c lab is pending. Recent glucose checks are elevated.",
    action: "Upload lab report and review diet adherence.",
  },
]

export const familyTrend = [
  { month: "Sep", self: 70, mother: 82, father: 64, average: 72 },
  { month: "Oct", self: 71, mother: 83, father: 65, average: 73 },
  { month: "Nov", self: 73, mother: 84, father: 63, average: 73 },
  { month: "Dec", self: 72, mother: 84, father: 62, average: 73 },
  { month: "Jan", self: 72, mother: 85, father: 63, average: 73 },
  { month: "Feb", self: 72, mother: 84, father: 62, average: 73 },
]

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
