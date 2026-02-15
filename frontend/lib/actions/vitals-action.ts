"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TVitals, VitalsSummary } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getVitals(): Promise<ApiResponse<TVitals[]>> {
  try {
    const response = await api.get(API.VITALS.LIST);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to fetch vitals";
    return { success: false, message: errorMessage };
  }
}

export async function getVitalsSummary(): Promise<ApiResponse<VitalsSummary>> {
  try {
    const response = await api.get(API.VITALS.SUMMARY);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Vitals summary fetched",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch vitals summary";
    return { success: false, message: errorMessage };
  }
}

export async function createVitals(payload: Partial<TVitals>) {
  try {
    const response = await api.post(API.VITALS.CREATE, payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Vitals created",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to create vitals";
    return { success: false, message: errorMessage };
  }
}

export async function updateVitals(id: string, payload: Partial<TVitals>) {
  try {
    const response = await api.patch(API.VITALS.UPDATE(id), payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Vitals updated",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to update vitals";
    return { success: false, message: errorMessage };
  }
}

export async function deleteVitals(id: string) {
  try {
    const response = await api.delete(API.VITALS.DELETE(id));
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Vitals deleted",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to delete vitals";
    return { success: false, message: errorMessage };
  }
}
