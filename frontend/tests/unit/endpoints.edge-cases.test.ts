import { API } from "@/lib/api/endpoints";

describe("Endpoints edge cases", () => {
  it("builds admin users list with empty params object", () => {
    expect(API.ADMIN.USERS.LIST({})).toBe("/admin/users?page=1&limit=10");
  });

  it("keeps explicit zero-like medical-record pagination values", () => {
    expect(API.MEDICAL_RECORDS.LIST({ page: 0, limit: 0 })).toBe(
      "/medical-records?page=0&limit=0",
    );
  });

  it("builds notifications list with unreadOnly false", () => {
    expect(API.NOTIFICATIONS.LIST({ page: 3, limit: 15, unreadOnly: false })).toBe(
      "/notifications?page=3&limit=15&unreadOnly=false",
    );
  });

  it("builds family member update path with group and member id", () => {
    expect(API.FAMILY.UPDATE_MEMBER("group-1", "member-7")).toBe(
      "/family-groups/group-1/members/member-7",
    );
  });
});

