"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";
import { TUser } from "../definition";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

// Get all users
export async function getAllUsers(): Promise<ApiResponse<TUser[]>> {
  try {
    const response = await api.get(API.ADMIN.USERS.LIST);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch users";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<ApiResponse<TUser>> {
  try {
    const response = await api.get(API.ADMIN.USERS.GET(id));
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message || error.message || "Failed to fetch user";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Create user (using FormData for multer compatibility)
export async function createUser(formData: FormData): Promise<ApiResponse<TUser>> {
  try {
    const response = await api.post(API.ADMIN.USERS.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "User created successfully",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to create user";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Update user
export async function updateUser(
  id: string,
  formData: FormData
): Promise<ApiResponse<TUser>> {
  try {
    const response = await api.patch(API.ADMIN.USERS.UPDATE(id), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "User updated successfully",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to update user";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Delete user
export async function deleteUser(id: string): Promise<ApiResponse> {
  try {
    const response = await api.delete(API.ADMIN.USERS.DELETE(id));
    return {
      success: true,
      message: response.data.message || "User deleted successfully",
    };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to delete user";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
