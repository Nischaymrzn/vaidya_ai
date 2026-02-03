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
