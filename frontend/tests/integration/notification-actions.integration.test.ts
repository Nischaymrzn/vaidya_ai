import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notification-action";
import { api } from "@/lib/api/axios-instance";

jest.mock("@/lib/api/axios-instance", () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("Notification actions integration (action + api layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("gets notifications with default list endpoint", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ _id: "n1", title: "Reminder", read: false }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      },
    });

    const result = await getNotifications();

    expect(api.get).toHaveBeenCalledWith("/notifications");
    expect(result.success).toBe(true);
    expect(result.data?.[0]._id).toBe("n1");
    expect(result.pagination?.page).toBe(1);
  });

  it("gets notifications with query params", async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: { success: true, data: [] },
    });

    const result = await getNotifications({ page: 2, limit: 5, unreadOnly: true });

    expect(api.get).toHaveBeenCalledWith(
      "/notifications?page=2&limit=5&unreadOnly=true",
    );
    expect(result.success).toBe(true);
  });

  it("marks one notification as read", async () => {
    (api.patch as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        data: { _id: "n1", read: true },
        message: "Notification marked as read",
      },
    });

    const result = await markNotificationRead("n1");

    expect(api.patch).toHaveBeenCalledWith("/notifications/n1/read");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Notification marked as read");
  });

  it("returns backend error when marking all as read fails", async () => {
    (api.patch as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Unable to update notifications" } },
      message: "Request failed",
    });

    const result = await markAllNotificationsRead();

    expect(api.patch).toHaveBeenCalledWith("/notifications/read-all");
    expect(result).toEqual({
      success: false,
      message: "Unable to update notifications",
    });
  });
});

