// list of backend routes

export const API = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
    GOOGLE: "/auth/google",
    GOOGLE_STATUS: "/auth/google/status",
    REQUEST_PASSWORD_RESET: "/auth/request-password-reset",
    RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
  },
  ADMIN: {
    USERS: {
      LIST: (params?: { page?: number; limit?: number }) =>
        params
          ? `/admin/users?page=${params.page ?? 1}&limit=${params.limit ?? 10}`
          : "/admin/users",
      GET: (id: string) => `/admin/users/${id}`,
      CREATE: "/admin/users",
      UPDATE: (id: string) => `/admin/users/${id}`,
      DELETE: (id: string) => `/admin/users/${id}`,
    },
  },
  USER: {
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  MEDICAL_RECORDS: {
    LIST: (params?: { page?: number; limit?: number }) =>
      params
        ? `/medical-records?page=${params.page ?? 1}&limit=${params.limit ?? 10}`
        : "/medical-records",
    GET: (id: string) => `/medical-records/${id}`,
    CREATE: "/medical-records",
    UPDATE: (id: string) => `/medical-records/${id}`,
    DELETE: (id: string) => `/medical-records/${id}`,
  },
  ALLERGIES: {
    LIST: "/allergies",
    GET: (id: string) => `/allergies/${id}`,
    CREATE: "/allergies",
    UPDATE: (id: string) => `/allergies/${id}`,
    DELETE: (id: string) => `/allergies/${id}`,
  },
  VITALS: {
    LIST: "/vitals",
    SUMMARY: "/vitals/summary",
    GET: (id: string) => `/vitals/${id}`,
    CREATE: "/vitals",
    UPDATE: (id: string) => `/vitals/${id}`,
    DELETE: (id: string) => `/vitals/${id}`,
  },
  SYMPTOMS: {
    LIST: "/symptoms",
    GET: (id: string) => `/symptoms/${id}`,
    CREATE: "/symptoms",
    UPDATE: (id: string) => `/symptoms/${id}`,
    DELETE: (id: string) => `/symptoms/${id}`,
  },
  MEDICATIONS: {
    LIST: "/medications",
    GET: (id: string) => `/medications/${id}`,
    CREATE: "/medications",
    UPDATE: (id: string) => `/medications/${id}`,
    DELETE: (id: string) => `/medications/${id}`,
  },
  LAB_TESTS: {
    LIST: "/lab-tests",
    GET: (id: string) => `/lab-tests/${id}`,
    CREATE: "/lab-tests",
    UPDATE: (id: string) => `/lab-tests/${id}`,
    DELETE: (id: string) => `/lab-tests/${id}`,
  },
  IMMUNIZATIONS: {
    LIST: "/immunizations",
    GET: (id: string) => `/immunizations/${id}`,
    CREATE: "/immunizations",
    UPDATE: (id: string) => `/immunizations/${id}`,
    DELETE: (id: string) => `/immunizations/${id}`,
  },
  NOTIFICATIONS: {
    LIST: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
      params
        ? `/notifications?page=${params.page ?? 1}&limit=${params.limit ?? 20}&unreadOnly=${params.unreadOnly ? "true" : "false"}`
        : "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },
  AI: {
    SCAN: "/ai-scan",
    INSIGHTS: "/ai-insights",
  },
  RISK_ASSESSMENTS: {
    LIST: "/risk-assessments",
    GET: (id: string) => `/risk-assessments/${id}`,
    GENERATE: "/risk-assessments/generate",
  },
  HEALTH_INSIGHTS: {
    LIST: (riskId?: string) =>
      riskId ? `/health-insights?riskId=${riskId}` : "/health-insights",
    GET: (id: string) => `/health-insights/${id}`,
  },
  ANALYTICS: {
    SUMMARY: (params?: { months?: number }) =>
      params?.months
        ? `/analytics/summary?months=${params.months}`
        : "/analytics/summary",
  },
  DASHBOARD: {
    SUMMARY: "/dashboard/summary",
  },
};
