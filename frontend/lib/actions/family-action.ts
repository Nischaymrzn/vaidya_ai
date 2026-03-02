"use server";

import { api } from "../api/axios-instance";
import { API } from "../api/endpoints";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type FamilyMemberSummary = {
  userId: string;
  role: string;
  relation?: string;
  joinedAt?: string;
  name?: string;
  email?: string;
  age?: number | null;
  gender?: string | null;
  latestVitals?: {
    recordedAt?: string;
    systolicBp?: number;
    diastolicBp?: number;
    glucoseLevel?: number;
    heartRate?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  } | null;
  recentVitals?: Array<{
    recordedAt?: string;
    systolicBp?: number | null;
    diastolicBp?: number | null;
    glucoseLevel?: number | null;
    heartRate?: number | null;
    weight?: number | null;
    height?: number | null;
    bmi?: number | null;
  }> | null;
  lastUpdated?: string | null;
  healthScore?: number | null;
  status?: "stable" | "warning" | "critical";
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
};

export type FamilyGroup = {
  _id: string;
  name: string;
  adminId: string;
  members: FamilyMemberSummary[];
  createdAt?: string;
  updatedAt?: string;
};

export type FamilyInvite = {
  token: string;
  inviteLink: string;
  expiresAt?: string;
};

export type FamilyGroupSummary = {
  group: {
    _id: string;
    name: string;
    adminId: string;
    score?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  members: FamilyMemberSummary[];
  currentUser?: {
    id: string;
    role: "admin" | "member";
    relation?: string | null;
  };
  familyScore?: number | null;
};

export async function getMyFamilyGroup(): Promise<ApiResponse<FamilyGroup>> {
  try {
    const response = await api.get(API.FAMILY.MY_GROUP);
    return { success: true, data: response.data.data || response.data };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch family group";
    return { success: false, message: errorMessage };
  }
}

export async function getFamilyGroupSummary(): Promise<
  ApiResponse<FamilyGroupSummary>
> {
  try {
    const response = await api.get(API.FAMILY.SUMMARY);
    return { success: true, data: response.data.data || response.data };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch family summary";
    return { success: false, message: errorMessage };
  }
}

export async function createFamilyGroup(
  payload: { name: string }
): Promise<ApiResponse<FamilyGroup>> {
  try {
    const response = await api.post(API.FAMILY.GROUP, payload);
    return { success: true, data: response.data.data || response.data };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to create family group";
    return { success: false, message: errorMessage };
  }
}

export async function createFamilyInvite(
  groupId: string,
  payload?: { expiresInDays?: number }
): Promise<ApiResponse<FamilyInvite>> {
  try {
    const response = await api.post(API.FAMILY.INVITE(groupId), payload ?? {});
    return { success: true, data: response.data.data || response.data };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to generate invite link";
    return { success: false, message: errorMessage };
  }
}

export async function addFamilyMemberById(
  groupId: string,
  payload: { userId: string; relation?: string }
): Promise<ApiResponse<FamilyGroup>> {
  try {
    const response = await api.post(API.FAMILY.ADD_MEMBER(groupId), payload);
    return { success: true, data: response.data.data || response.data };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to add family member";
    return { success: false, message: errorMessage };
  }
}

export async function updateFamilyMemberRelation(
  groupId: string,
  memberId: string,
  payload: { relation?: string }
): Promise<ApiResponse<FamilyGroup>> {
  try {
    const response = await api.patch(
      API.FAMILY.UPDATE_MEMBER(groupId, memberId),
      payload
    );
    return { success: true, data: response.data.data || response.data };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to update member relation";
    return { success: false, message: errorMessage };
  }
}

export async function joinFamilyInvite(
  token: string,
  payload?: { relation?: string }
): Promise<ApiResponse<FamilyGroup>> {
  try {
    const response = await api.post(API.FAMILY.JOIN(token), payload ?? {});
    return { success: true, data: response.data.data || response.data };
  } catch (error: Error | any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Failed to join family group";
    return { success: false, message: errorMessage };
  }
}
