import { act, renderHook, waitFor } from "@testing-library/react";
import { useSignIn } from "@/app/(auth)/_hooks/use-log-in";
import { signin } from "@/lib/actions/auth-action";
import { createSession } from "@/lib/session";
import { toast } from "sonner";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/lib/actions/auth-action", () => ({
  signin: jest.fn(),
}));

jest.mock("@/lib/session", () => ({
  createSession: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useSignIn hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates session and redirects user role to dashboard", async () => {
    (signin as jest.Mock).mockResolvedValue({
      success: true,
      message: "Signed in",
      data: {
        accessToken: "token-user",
        user: { role: "user" },
      },
    });

    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.onSubmit({
        email: "user@example.com",
        password: "User123!@#",
      });
    });

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith("token-user");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("redirects admin role to admin users page", async () => {
    (signin as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        accessToken: "token-admin",
        user: { role: "admin" },
      },
    });

    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.onSubmit({
        email: "admin@example.com",
        password: "User123!@#",
      });
    });

    await waitFor(() => {
      expect(createSession).toHaveBeenCalledWith("token-admin");
      expect(pushMock).toHaveBeenCalledWith("/admin/users");
    });
  });

  it("shows error toast and skips redirect when access token is missing", async () => {
    (signin as jest.Mock).mockResolvedValue({
      success: false,
      message: "Invalid credentials",
      data: {},
    });

    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.onSubmit({
        email: "user@example.com",
        password: "wrong-password",
      });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      expect(createSession).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it("handles signin exceptions with fallback error message", async () => {
    (signin as jest.Mock).mockRejectedValue(new Error("Network issue"));

    const { result } = renderHook(() => useSignIn());

    await act(async () => {
      await result.current.onSubmit({
        email: "user@example.com",
        password: "User123!@#",
      });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network issue");
      expect(createSession).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});

