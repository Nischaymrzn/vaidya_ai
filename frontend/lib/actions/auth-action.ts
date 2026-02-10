"use server";

import { LoginFormData, SignupFormData } from "@/app/(auth)/_schemas/schemas";
import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { clearSession } from "../session";

export async function signup(data: SignupFormData) {
  try {
    const response = await api.post(API.AUTH.REGISTER, data);
    return response.data;
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Signup failed";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function signin(credentials: LoginFormData) {
  try {
    const response = await api.post(API.AUTH.LOGIN, credentials);
    return response.data;
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Signin failed";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function logout() {
  await clearSession();
}

export async function getMe() {
  try {
    const response = await api.get(API.AUTH.ME);
    return response.data;
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Fetching user failed";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

function formatErrorMessage(
  err: unknown,
  fallback: string
): string {
  const data = (err as { response?: { data?: { message?: unknown } }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const first = Object.values(data).flat()[0];
    return typeof first === "string" ? first : fallback;
  }
  return fallback;
}

export async function requestPasswordReset(email: string) {
  try {
    const response = await api.post(API.AUTH.REQUEST_PASSWORD_RESET, {
      email,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: formatErrorMessage(error, "Failed to send reset email"),
    };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const response = await api.post(API.AUTH.RESET_PASSWORD(token), {
      newPassword,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: formatErrorMessage(error, "Failed to reset password"),
    };
  }
}
