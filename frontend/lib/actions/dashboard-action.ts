"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import type { DashboardSummary } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  try {
    const response = await api.get(API.DASHBOARD.SUMMARY);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Dashboard summary fetched",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch dashboard summary";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
