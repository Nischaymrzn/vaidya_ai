"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { THealthInsight } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getHealthInsights(
  riskId?: string,
): Promise<ApiResponse<THealthInsight[]>> {
  try {
    const response = await api.get(API.HEALTH_INSIGHTS.LIST(riskId));
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch insights";
    return { success: false, message: errorMessage };
  }
}
