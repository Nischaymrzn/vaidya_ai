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
};
