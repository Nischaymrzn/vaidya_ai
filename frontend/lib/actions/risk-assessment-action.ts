"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import type { TRiskAssessment, THealthInsight } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getRiskAssessments(): Promise<
  ApiResponse<TRiskAssessment[]>
> {
  try {
    const response = await api.get(API.RISK_ASSESSMENTS.LIST);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Risk assessments fetched",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch risk assessments";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getLatestRiskAssessment(): Promise<
  TRiskAssessment | null
> {
  const result = await getRiskAssessments();
  if (!result.success || !result.data?.length) return null;
  return result.data[0];
}

export async function generateRiskAssessment(payload?: {
  vitalsIds?: string[];
  symptomsIds?: string[];
  maxInsights?: number;
  notes?: string;
  useLatest?: boolean;
  includeAi?: boolean;
  includeAnalysis?: boolean;
  reportId?: string;
}): Promise<
  ApiResponse<{
    assessment?: TRiskAssessment;
    insights?: THealthInsight[];
    sources?: {
      vitalsIds?: string[];
      symptomsIds?: string[];
      medicationId?: string;
    };
    signals?: Record<string, unknown>;
  }>
> {
  try {
    const response = await api.post(API.RISK_ASSESSMENTS.GENERATE, payload ?? {});
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Risk assessment generated",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to generate risk assessment";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
