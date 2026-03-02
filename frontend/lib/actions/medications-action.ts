"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TMedication } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getMedications(params?: {
  userId?: string;
}): Promise<ApiResponse<TMedication[]>> {
  try {
    const response = await api.get(API.MEDICATIONS.LIST(params));
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch medications";
    return { success: false, message: errorMessage };
  }
}
