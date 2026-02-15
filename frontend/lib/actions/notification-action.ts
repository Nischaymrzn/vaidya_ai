"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TNotification } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<ApiResponse<TNotification[]>> {
  try {
    const response = await api.get(API.NOTIFICATIONS.LIST(params));
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch notifications";
    return { success: false, message: errorMessage };
  }
}

export async function markNotificationRead(
  id: string,
): Promise<ApiResponse<TNotification>> {
  try {
    const response = await api.patch(API.NOTIFICATIONS.MARK_READ(id));
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Notification marked as read",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to mark notification";
    return { success: false, message: errorMessage };
  }
}

export async function markAllNotificationsRead(): Promise<ApiResponse> {
  try {
    const response = await api.patch(API.NOTIFICATIONS.MARK_ALL_READ);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "All notifications marked as read",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to mark notifications";
    return { success: false, message: errorMessage };
  }
}
