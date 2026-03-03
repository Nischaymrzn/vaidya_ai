import { getMe, requestPasswordReset, resetPassword, signin, signup } from "@/lib/actions/auth-action";
import { api } from "@/lib/api/axios-instance";
import { clearSession } from "@/lib/session";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock("@/lib/session", () => ({
  clearSession: jest.fn(),
}));

describe("Auth actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns signup response on success", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Registered" },
    });

    const result = await signup({
      name: "New User",
      email: "new@example.com",
      password: "User123!@#",
      confirmPassword: "User123!@#",
    });

    expect(api.post).toHaveBeenCalledWith("/auth/register", expect.any(Object));
    expect(result).toEqual({ success: true, message: "Registered" });
  });

  it("returns signin payload on success", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: { accessToken: "token-1", user: { role: "user" } },
      },
    });

    const result = await signin({
      email: "user@example.com",
      password: "User123!@#",
    });

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "user@example.com",
      password: "User123!@#",
    });
    expect(result.success).toBe(true);
    expect(result.data.accessToken).toBe("token-1");
  });

  it("returns backend message on signin failure", async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
      message: "Request failed",
    });

    const result = await signin({
      email: "bad@example.com",
      password: "wrong",
    });

    expect(result).toEqual({
      success: false,
      message: "Invalid credentials",
    });
  });

  it("returns current user data on getMe success", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: { id: "u1", email: "user@example.com" } },
    });

    const result = await getMe();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("user@example.com");
  });

  it("returns fallback structure on getMe failure", async () => {
    (api.get as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Unauthorized" } },
      message: "401",
    });

    const result = await getMe();

    expect(result).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(clearSession).not.toHaveBeenCalled();
  });

  it("handles requestPasswordReset error map", async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Email not found" } },
    });

    const result = await requestPasswordReset("unknown@example.com");

    expect(result).toEqual({ success: false, message: "Email not found" });
  });

  it("handles resetPassword success flow", async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, message: "Password reset complete" },
    });

    const result = await resetPassword("token-abc", "NewPass123!");

    expect(api.post).toHaveBeenCalledWith("/auth/reset-password/token-abc", {
      newPassword: "NewPass123!",
    });
    expect(result).toEqual({ success: true, message: "Password reset complete" });
  });
});

