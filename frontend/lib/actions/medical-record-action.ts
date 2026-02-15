"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TMedicalRecord } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export async function getMedicalRecords(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<TMedicalRecord[]> & { pagination?: PaginationInfo }> {
  try {
    const response = await api.get(
      API.MEDICAL_RECORDS.LIST({
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      }),
    );
    const data = response.data.data ?? response.data;
    const pagination = response.data.pagination;
    return {
      success: true,
      data: Array.isArray(data) ? data : [],
      pagination,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch medical records";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getMedicalRecordById(
  id: string,
): Promise<ApiResponse<TMedicalRecord>> {
  try {
    const response = await api.get(API.MEDICAL_RECORDS.GET(id));
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch medical record";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function createMedicalRecord(
  formData: FormData,
): Promise<ApiResponse<TMedicalRecord>> {
  try {
    const response = await api.post(API.MEDICAL_RECORDS.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Medical record created",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to create medical record";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function updateMedicalRecord(
  id: string,
  formData: FormData,
): Promise<ApiResponse<TMedicalRecord>> {
  try {
    const response = await api.patch(API.MEDICAL_RECORDS.UPDATE(id), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Medical record updated",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to update medical record";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function deleteMedicalRecord(
  id: string,
): Promise<ApiResponse> {
  try {
    const response = await api.delete(API.MEDICAL_RECORDS.DELETE(id));
    return {
      success: true,
      message: response.data.message || "Medical record deleted",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to delete medical record";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
