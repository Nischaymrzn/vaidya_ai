import { API } from "@/lib/api/endpoints";

describe("API endpoints", () => {
  it("builds family and medical-record paths correctly", () => {
    expect(API.FAMILY.INVITE("group-1")).toBe("/family-groups/group-1/invitations");
    expect(API.FAMILY.UPDATE_MEMBER("group-1", "member-1")).toBe(
      "/family-groups/group-1/members/member-1",
    );
    expect(API.MEDICAL_RECORDS.GET("record-1")).toBe("/medical-records/record-1");
  });

  it("builds query params for list endpoints", () => {
    expect(API.MEDICAL_RECORDS.LIST({ page: 2, limit: 5, userId: "user@x.com" })).toBe(
      "/medical-records?page=2&limit=5&userId=user%40x.com",
    );
    expect(API.ALLERGIES.LIST({ userId: "family member" })).toBe(
      "/allergies?userId=family%20member",
    );
    expect(API.ANALYTICS.SUMMARY({ months: 6 })).toBe("/analytics/summary?months=6");
  });

  it("builds auth static endpoints", () => {
    expect(API.AUTH.REGISTER).toBe("/auth/register");
    expect(API.AUTH.LOGIN).toBe("/auth/login");
    expect(API.AUTH.ME).toBe("/auth/me");
    expect(API.AUTH.GOOGLE).toBe("/auth/google");
    expect(API.AUTH.GOOGLE_STATUS).toBe("/auth/google/status");
    expect(API.AUTH.REQUEST_PASSWORD_RESET).toBe("/auth/request-password-reset");
  });

  it("builds auth reset-password endpoint with token", () => {
    expect(API.AUTH.RESET_PASSWORD("abc123")).toBe("/auth/reset-password/abc123");
  });

  it("builds admin users list endpoint with defaults and custom params", () => {
    expect(API.ADMIN.USERS.LIST()).toBe("/admin/users");
    expect(API.ADMIN.USERS.LIST({})).toBe("/admin/users?page=1&limit=10");
    expect(API.ADMIN.USERS.LIST({ page: 4, limit: 50 })).toBe("/admin/users?page=4&limit=50");
  });

  it("builds admin users CRUD endpoints", () => {
    expect(API.ADMIN.USERS.GET("user-1")).toBe("/admin/users/user-1");
    expect(API.ADMIN.USERS.CREATE).toBe("/admin/users");
    expect(API.ADMIN.USERS.UPDATE("user-1")).toBe("/admin/users/user-1");
    expect(API.ADMIN.USERS.DELETE("user-1")).toBe("/admin/users/user-1");
  });

  it("builds user CRUD endpoints", () => {
    expect(API.USER.GET("u1")).toBe("/users/u1");
    expect(API.USER.UPDATE("u1")).toBe("/users/u1");
    expect(API.USER.DELETE("u1")).toBe("/users/u1");
  });

  it("builds user-data endpoints", () => {
    expect(API.USER_DATA.GET).toBe("/user-data");
    expect(API.USER_DATA.UPDATE).toBe("/user-data");
  });

  it("builds medical records list endpoint with default pagination", () => {
    expect(API.MEDICAL_RECORDS.LIST()).toBe("/medical-records?page=1&limit=10");
    expect(API.MEDICAL_RECORDS.LIST({})).toBe("/medical-records?page=1&limit=10");
  });

  it("builds medical records list endpoint with user filter", () => {
    expect(API.MEDICAL_RECORDS.LIST({ userId: "family user" })).toBe(
      "/medical-records?page=1&limit=10&userId=family+user",
    );
  });

  it("builds medical records CRUD endpoints", () => {
    expect(API.MEDICAL_RECORDS.GET("mr1")).toBe("/medical-records/mr1");
    expect(API.MEDICAL_RECORDS.CREATE).toBe("/medical-records");
    expect(API.MEDICAL_RECORDS.UPDATE("mr1")).toBe("/medical-records/mr1");
    expect(API.MEDICAL_RECORDS.DELETE("mr1")).toBe("/medical-records/mr1");
  });

  it("builds allergies list endpoint with and without user filter", () => {
    expect(API.ALLERGIES.LIST()).toBe("/allergies");
    expect(API.ALLERGIES.LIST({ userId: "member+name@example.com" })).toBe(
      "/allergies?userId=member%2Bname%40example.com",
    );
  });

  it("builds allergies CRUD endpoints", () => {
    expect(API.ALLERGIES.GET("a1")).toBe("/allergies/a1");
    expect(API.ALLERGIES.CREATE).toBe("/allergies");
    expect(API.ALLERGIES.UPDATE("a1")).toBe("/allergies/a1");
    expect(API.ALLERGIES.DELETE("a1")).toBe("/allergies/a1");
  });

  it("builds vitals list and summary endpoints", () => {
    expect(API.VITALS.LIST).toBe("/vitals");
    expect(API.VITALS.SUMMARY).toBe("/vitals/summary");
  });

  it("builds vitals CRUD endpoints", () => {
    expect(API.VITALS.GET("v1")).toBe("/vitals/v1");
    expect(API.VITALS.CREATE).toBe("/vitals");
    expect(API.VITALS.UPDATE("v1")).toBe("/vitals/v1");
    expect(API.VITALS.DELETE("v1")).toBe("/vitals/v1");
  });

  it("builds symptom endpoints", () => {
    expect(API.SYMPTOMS.LIST).toBe("/symptoms");
    expect(API.SYMPTOMS.GET("s1")).toBe("/symptoms/s1");
    expect(API.SYMPTOMS.CREATE).toBe("/symptoms");
    expect(API.SYMPTOMS.UPDATE("s1")).toBe("/symptoms/s1");
    expect(API.SYMPTOMS.DELETE("s1")).toBe("/symptoms/s1");
  });

  it("builds medications list endpoint with and without user filter", () => {
    expect(API.MEDICATIONS.LIST()).toBe("/medications");
    expect(API.MEDICATIONS.LIST({ userId: "family member" })).toBe(
      "/medications?userId=family%20member",
    );
  });

  it("builds medications CRUD endpoints", () => {
    expect(API.MEDICATIONS.GET("m1")).toBe("/medications/m1");
    expect(API.MEDICATIONS.CREATE).toBe("/medications");
    expect(API.MEDICATIONS.UPDATE("m1")).toBe("/medications/m1");
    expect(API.MEDICATIONS.DELETE("m1")).toBe("/medications/m1");
  });

  it("builds immunization endpoints", () => {
    expect(API.IMMUNIZATIONS.LIST).toBe("/immunizations");
    expect(API.IMMUNIZATIONS.GET("i1")).toBe("/immunizations/i1");
    expect(API.IMMUNIZATIONS.CREATE).toBe("/immunizations");
    expect(API.IMMUNIZATIONS.UPDATE("i1")).toBe("/immunizations/i1");
    expect(API.IMMUNIZATIONS.DELETE("i1")).toBe("/immunizations/i1");
  });

  it("builds notifications list endpoint for defaults and custom params", () => {
    expect(API.NOTIFICATIONS.LIST()).toBe("/notifications");
    expect(API.NOTIFICATIONS.LIST({})).toBe("/notifications?page=1&limit=20&unreadOnly=false");
    expect(API.NOTIFICATIONS.LIST({ page: 3, limit: 5, unreadOnly: true })).toBe(
      "/notifications?page=3&limit=5&unreadOnly=true",
    );
  });

  it("builds notifications mark-as-read endpoints", () => {
    expect(API.NOTIFICATIONS.MARK_READ("n1")).toBe("/notifications/n1/read");
    expect(API.NOTIFICATIONS.MARK_ALL_READ).toBe("/notifications/read-all");
  });

  it("builds ai endpoints", () => {
    expect(API.AI.SCAN).toBe("/ai-scan");
    expect(API.AI.INSIGHTS).toBe("/ai-insights");
  });

  it("builds risk-assessment endpoints", () => {
    expect(API.RISK_ASSESSMENTS.LIST).toBe("/risk-assessments");
    expect(API.RISK_ASSESSMENTS.GET("r1")).toBe("/risk-assessments/r1");
    expect(API.RISK_ASSESSMENTS.GENERATE).toBe("/risk-assessments/generate");
  });

  it("builds health-insights endpoints", () => {
    expect(API.HEALTH_INSIGHTS.LIST()).toBe("/health-insights");
    expect(API.HEALTH_INSIGHTS.LIST("risk-9")).toBe("/health-insights?riskId=risk-9");
    expect(API.HEALTH_INSIGHTS.GET("h1")).toBe("/health-insights/h1");
  });

  it("builds analytics summary endpoint with and without months", () => {
    expect(API.ANALYTICS.SUMMARY()).toBe("/analytics/summary");
    expect(API.ANALYTICS.SUMMARY({ months: 12 })).toBe("/analytics/summary?months=12");
  });

  it("builds dashboard and family static endpoints", () => {
    expect(API.DASHBOARD.SUMMARY).toBe("/dashboard/summary");
    expect(API.FAMILY.GROUP).toBe("/family-groups");
    expect(API.FAMILY.MY_GROUP).toBe("/family-groups/me");
    expect(API.FAMILY.SUMMARY).toBe("/family-groups/me/summary");
  });

  it("builds family dynamic and prediction endpoints", () => {
    expect(API.FAMILY.INVITE("g1")).toBe("/family-groups/g1/invitations");
    expect(API.FAMILY.ADD_MEMBER("g1")).toBe("/family-groups/g1/members");
    expect(API.FAMILY.UPDATE_MEMBER("g1", "m1")).toBe("/family-groups/g1/members/m1");
    expect(API.FAMILY.JOIN("t1")).toBe("/family-groups/join/t1");
    expect(API.PREDICTION.SYMPTOM).toBe("/predict/symptom");
    expect(API.PREDICTION.HEART_DISEASE).toBe("/predict/heart-disease");
    expect(API.PREDICTION.TUBERCULOSIS).toBe("/predict/tuberculosis");
  });
});
