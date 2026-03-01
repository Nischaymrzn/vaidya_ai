"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TSymptoms } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getSymptoms(): Promise<ApiResponse<TSymptoms[]>> {
  try {
    const response = await api.get(API.SYMPTOMS.LIST);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to fetch symptoms";
    return { success: false, message: errorMessage };
  }
}

export async function createSymptom(payload: Partial<TSymptoms>): Promise<ApiResponse<TSymptoms>> {
  try {
    const response = await api.post(API.SYMPTOMS.CREATE, payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Symptom added successfully",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to add symptom";
    return { success: false, message: errorMessage };
  }
}

export async function updateSymptom(id: string, payload: Partial<TSymptoms>): Promise<ApiResponse<TSymptoms>> {
  try {
    const response = await api.patch(API.SYMPTOMS.UPDATE(id), payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: "Symptom updated successfully",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to update symptom";
    return { success: false, message: errorMessage };
  }
}

export async function deleteSymptom(id: string): Promise<ApiResponse> {
  try {
    await api.delete(API.SYMPTOMS.DELETE(id));
    return {
      success: true,
      message: "Symptom deleted successfully",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to delete symptom";
    return { success: false, message: errorMessage };
  }
}
