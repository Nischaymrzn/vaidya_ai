"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import type {
  THeartDiseasePredictionResponse,
  TPredictionResponse,
  TTuberculosisPredictionResponse,
} from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const maybe = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return maybe.response?.data?.message || maybe.message || fallback;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
};

export async function predictDisease(
  symptoms: string[],
): Promise<ApiResponse<TPredictionResponse>> {
  try {
    const response = await api.post(API.PREDICTION.SYMPTOM, { symptoms });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Prediction generated",
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to generate prediction",
    );
    return { success: false, message: errorMessage };
  }
}

export type HeartDiseasePredictionPayload = {
  gender: string | number;
  smoking_history: string | number;
  age: string | number;
  bmi: string | number;
  HbA1c_level: string | number;
  blood_glucose_level: string | number;
  hypertension: string | number | boolean;
  heart_disease: string | number | boolean;
};

export async function predictHeartDisease(
  payload: HeartDiseasePredictionPayload,
): Promise<ApiResponse<THeartDiseasePredictionResponse>> {
  try {
    const response = await api.post(API.PREDICTION.HEART_DISEASE, payload);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Heart disease prediction generated",
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to generate heart disease prediction",
    );
    return { success: false, message: errorMessage };
  }
}

export async function predictTuberculosis(
  formData: FormData,
): Promise<ApiResponse<TTuberculosisPredictionResponse>> {
  try {
    const response = await api.post(API.PREDICTION.TUBERCULOSIS, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Tuberculosis prediction generated",
    };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(
      error,
      "Failed to generate tuberculosis prediction",
    );
    return { success: false, message: errorMessage };
  }
}
