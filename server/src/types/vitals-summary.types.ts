import type { VitalsDb } from "../models/vitals.model";

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
  records: VitalsDb[];
};
