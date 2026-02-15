"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type AiScanResult = {
  text?: string;
  recordType?: string;
  provider?: string;
  recordDate?: string;
  summary?: string;
  structured?: Record<string, unknown>;
};

export async function scanMedicalImage(
  formData: FormData,
): Promise<ApiResponse<AiScanResult>> {
  try {
    const response = await api.post(API.AI.SCAN, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Scan completed",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to scan image";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function generateAiInsights(
  input: string,
  maxItems = 3,
  force = false,
) {
  try {
    const response = await api.post(API.AI.INSIGHTS, {
      input,
      maxItems,
      force,
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Insights generated",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to generate insights";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
