"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TUser } from "../definition";

export type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export async function updateProfile(
  userId: string,
  formData: FormData
): Promise<ApiResponse<TUser>> {
  try {
    const response = await api.put(API.USER.UPDATE(userId), formData);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Profile updated",
    };
  } catch (error: Error | unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Update failed",
    };
  }
}

export async function deleteAccount(userId: string): Promise<ApiResponse> {
  try {
    await api.delete(API.USER.DELETE(userId));
    return { success: true, message: "Account deleted" };
  } catch (error: Error | unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Delete failed",
    };
  }
}
