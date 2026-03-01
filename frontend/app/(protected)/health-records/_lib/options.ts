export const defaultVisitTypes = [
  "Routine",
  "Follow-up",
  "Emergency",
  "Teleconsult",
  "Procedure",
]

export const statusOptions = ["All", "Verified", "Processed", "Reviewed", "Active"]

export const diagnosisStatusOptions = ["active", "resolved", "unknown"]

export const symptomStatusOptions = ["ongoing", "resolved", "unknown"]

export const dateOptions = ["Any time", "Last 30 days", "Last 90 days", "2026", "2025"]

export const sortOptions = ["Last updated", "Name A-Z", "Name Z-A"]

export const recordTypes = [
  "Visit",
  "Vitals",
  "Diagnosis",
  "Imaging",
  "Prescription",
  "Allergy",
  "Immunization",
]

export const extraCategoryOptions = ["Insurance"]

export const categoryAliases: Record<string, string> = {
  "visit notes": "Visit",
  visits: "Visit",
  prescriptions: "Prescription",
  allergies: "Allergy",
  immunizations: "Immunization",
}

export const typeFieldMap: Record<
  string,
  { key: string; label: string; placeholder?: string }[]
> = {
  Vitals: [
    { key: "systolicBp", label: "BP systolic", placeholder: "120" },
    { key: "diastolicBp", label: "BP diastolic", placeholder: "80" },
    { key: "heartRate", label: "Heart rate", placeholder: "72" },
    { key: "glucoseLevel", label: "Glucose level", placeholder: "110" },
    { key: "weight", label: "Weight (kg)", placeholder: "70" },
    { key: "height", label: "Height (cm)", placeholder: "170" },
    { key: "bmi", label: "BMI", placeholder: "23.5" },
  ],
  Diagnosis: [
    { key: "symptomList", label: "Symptoms", placeholder: "fatigue, thirst" },
    { key: "severity", label: "Severity", placeholder: "Mild/Moderate" },
    { key: "status", label: "Symptom status", placeholder: "ongoing/resolved" },
    { key: "durationDays", label: "Duration (days)", placeholder: "30" },
    { key: "medicineName", label: "Medication", placeholder: "Metformin" },
    { key: "dosage", label: "Dosage", placeholder: "500 mg" },
    { key: "frequency", label: "Frequency", placeholder: "Once daily" },
  ],
  Imaging: [
    { key: "modality", label: "Modality", placeholder: "X-Ray" },
    { key: "region", label: "Body region", placeholder: "Chest" },
    { key: "finding", label: "Finding", placeholder: "Normal" },
  ],
  Prescription: [
    { key: "medicineName", label: "Medication", placeholder: "Metformin" },
    { key: "dosage", label: "Dosage", placeholder: "500 mg" },
    { key: "frequency", label: "Frequency", placeholder: "Once daily" },
    { key: "durationDays", label: "Duration (days)", placeholder: "90" },
    { key: "startDate", label: "Start date", placeholder: "2026-02-12" },
    { key: "endDate", label: "End date", placeholder: "2026-05-12" },
    { key: "purpose", label: "Purpose", placeholder: "Glucose control" },
    { key: "notes", label: "Notes", placeholder: "After meals" },
  ],
  Allergy: [
    { key: "allergen", label: "Allergen", placeholder: "Peanuts" },
    { key: "type", label: "Type", placeholder: "food/drug/environmental/other" },
    { key: "reaction", label: "Reaction", placeholder: "Hives" },
    { key: "severity", label: "Severity", placeholder: "mild/moderate/severe" },
    { key: "status", label: "Status", placeholder: "active/resolved" },
    { key: "onsetDate", label: "Onset date", placeholder: "2026-02-12" },
    { key: "recordedAt", label: "Recorded at", placeholder: "2026-02-12" },
    { key: "notes", label: "Notes", placeholder: "Additional context" },
  ],
  Immunization: [
    { key: "vaccineName", label: "Vaccine name", placeholder: "Hepatitis B" },
    { key: "date", label: "Date", placeholder: "2026-02-12" },
    { key: "doseNumber", label: "Dose number", placeholder: "2" },
    { key: "series", label: "Series", placeholder: "Primary" },
    { key: "manufacturer", label: "Manufacturer", placeholder: "GSK" },
    { key: "lotNumber", label: "Lot number", placeholder: "A1B2C3" },
    { key: "site", label: "Site", placeholder: "Left arm" },
    { key: "route", label: "Route", placeholder: "IM" },
    { key: "provider", label: "Provider", placeholder: "City Lab" },
    { key: "nextDue", label: "Next due", placeholder: "2026-08-12" },
    { key: "notes", label: "Notes", placeholder: "No adverse events" },
  ],
  Visit: [
    { key: "reasonForVisit", label: "Reason for visit", placeholder: "Follow-up" },
    { key: "chiefComplaint", label: "Chief complaint", placeholder: "Headache" },
    { key: "symptomList", label: "Symptoms", placeholder: "nausea, dizziness" },
    { key: "severity", label: "Severity", placeholder: "Mild/Moderate" },
    { key: "status", label: "Symptom status", placeholder: "ongoing/resolved" },
    { key: "durationDays", label: "Duration (days)", placeholder: "3" },
    { key: "medicineName", label: "Medication", placeholder: "Ibuprofen" },
    { key: "dosage", label: "Dosage", placeholder: "200 mg" },
    { key: "frequency", label: "Frequency", placeholder: "Twice daily" },
  ],
}

export const insightBadgeClasses: Record<string, string> = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Info: "border-sky-200 bg-sky-50 text-sky-700",
}
