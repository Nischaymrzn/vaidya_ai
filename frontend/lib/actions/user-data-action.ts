"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type UserVitalsSnapshot = {
  refId?: string;
  recordedAt?: string;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  glucoseLevel?: number | null;
  heartRate?: number | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
};

export type UserData = {
  userId: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  latestVitals?: UserVitalsSnapshot;
  vitals?: UserVitalsSnapshot;
  createdAt?: string;
  updatedAt?: string;
};

export async function getUserData(): Promise<ApiResponse<UserData>> {
  try {
    const response = await api.get(API.USER_DATA.GET);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to fetch user data";
    return { success: false, message: errorMessage };
  }
}
