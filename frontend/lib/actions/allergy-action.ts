"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TAllergy } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getAllergies(): Promise<ApiResponse<TAllergy[]>> {
  try {
    const response = await api.get(API.ALLERGIES.LIST);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to fetch allergies";
    return { success: false, message: errorMessage };
  }
}

export async function getAllergyById(
  id: string,
): Promise<ApiResponse<TAllergy>> {
  try {
    const response = await api.get(API.ALLERGIES.GET(id));
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to fetch allergy";
    return { success: false, message: errorMessage };
  }
}

export async function createAllergy(
  payload: Partial<TAllergy>,
): Promise<ApiResponse<TAllergy>> {
  try {
    const response = await api.post(API.ALLERGIES.CREATE, payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Allergy created",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to create allergy";
    return { success: false, message: errorMessage };
  }
}

export async function updateAllergy(
  id: string,
  payload: Partial<TAllergy>,
): Promise<ApiResponse<TAllergy>> {
  try {
    const response = await api.patch(API.ALLERGIES.UPDATE(id), payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Allergy updated",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to update allergy";
    return { success: false, message: errorMessage };
  }
}

export async function deleteAllergy(id: string): Promise<ApiResponse> {
  try {
    const response = await api.delete(API.ALLERGIES.DELETE(id));
    return {
      success: true,
      message: response.data.message || "Allergy deleted",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to delete allergy";
    return { success: false, message: errorMessage };
  }
}
