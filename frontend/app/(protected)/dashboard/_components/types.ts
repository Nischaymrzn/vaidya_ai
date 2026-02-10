import type { LucideIcon } from "lucide-react"

export type VitalDataPoint = {
  day: string
  heartRate: number
  systolic: number
  glucose: number
}

export type HealthScorePoint = {
  day: string
  score: number
}

export type SymptomDataPoint = {
  name: string
  frequency: number
}

export type MedicationItem = {
  name: string
  dose: string
  adherence: number
}

export type TimelineItem = {
  date: string
  title: string
  meta: string
}

export type RiskFactor = {
  label: string
  level: string
  score: number
}

export type InsightItem = {
  title: string
  body: string
}

export type ClinicalItem = {
  label: string
  value: string
  meta: string
  bg: string
}

export type SummaryCard = {
  title: string
  value: string
  note: string
  dot: string
  surface: string
  border: string
  valueClass: string
  icon: LucideIcon
  iconBg: string
  iconRing: string
  iconColor: string
  titleClass?: string
  noteClass?: string
}
