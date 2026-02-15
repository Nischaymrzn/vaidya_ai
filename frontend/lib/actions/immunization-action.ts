"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TImmunization } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getImmunizations(): Promise<ApiResponse<TImmunization[]>> {
  try {
    const response = await api.get(API.IMMUNIZATIONS.LIST);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch immunizations";
    return { success: false, message: errorMessage };
  }
}

export async function getImmunizationById(
  id: string,
): Promise<ApiResponse<TImmunization>> {
  try {
    const response = await api.get(API.IMMUNIZATIONS.GET(id));
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch immunization";
    return { success: false, message: errorMessage };
  }
}

export async function createImmunization(
  payload: Partial<TImmunization>,
): Promise<ApiResponse<TImmunization>> {
  try {
    const response = await api.post(API.IMMUNIZATIONS.CREATE, payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Immunization created",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to create immunization";
    return { success: false, message: errorMessage };
  }
}

export async function updateImmunization(
  id: string,
  payload: Partial<TImmunization>,
): Promise<ApiResponse<TImmunization>> {
  try {
    const response = await api.patch(API.IMMUNIZATIONS.UPDATE(id), payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Immunization updated",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to update immunization";
    return { success: false, message: errorMessage };
  }
}

export async function deleteImmunization(
  id: string,
): Promise<ApiResponse> {
  try {
    const response = await api.delete(API.IMMUNIZATIONS.DELETE(id));
    return {
      success: true,
      message: response.data.message || "Immunization deleted",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to delete immunization";
    return { success: false, message: errorMessage };
  }
}
