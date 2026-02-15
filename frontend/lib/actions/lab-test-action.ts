"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TLabTest } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getLabTests(): Promise<ApiResponse<TLabTest[]>> {
  try {
    const response = await api.get(API.LAB_TESTS.LIST);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to fetch lab tests";
    return { success: false, message: errorMessage };
  }
}
