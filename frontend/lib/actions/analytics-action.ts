"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import type { AnalyticsSummary } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getAnalyticsSummary(params?: {
  months?: number;
}): Promise<ApiResponse<AnalyticsSummary>> {
  try {
    const response = await api.get(API.ANALYTICS.SUMMARY(params));
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch analytics summary";
    return { success: false, message: errorMessage };
  }
}
