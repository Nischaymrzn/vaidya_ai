/** @jest-environment node */

import { POST } from "@/app/api/vaidya-care/route";
import { cookies } from "next/headers";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const cookiesMock = cookies as jest.MockedFunction<typeof cookies>;

describe("POST /api/vaidya-care", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it("returns 401 when access token is missing", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    } as any);

    const req = new Request("http://localhost/api/vaidya-care", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      success: false,
      message: "Unauthorized",
    });
  });

  it("proxies request to backend ai-chat and returns response", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test/v1/api";
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "token-123" }),
    } as any);

    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, reply: "AI response" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const req = new Request("http://localhost/api/vaidya-care", {
      method: "POST",
      body: JSON.stringify({ doctor: "trishan-wagle", messages: [] }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, reply: "AI response" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://api.test/v1/api/ai-chat",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("returns 500 when incoming payload is invalid JSON", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ value: "token-123" }),
    } as any);

    const req = new Request("http://localhost/api/vaidya-care", {
      method: "POST",
      body: "{invalid-json",
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({
      success: false,
      message: "Failed to process request",
    });
  });
});
