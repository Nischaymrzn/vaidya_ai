import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/app/(auth)/_schemas/schemas";
import { AI_DOCTOR_CATALOG, AI_MODULE_CATALOG } from "@/lib/ai-catalog";

describe("Auth schemas and AI catalog units", () => {
  it("accepts valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "User123!@#",
    });

    expect(result.success).toBe(true);
  });

  it("rejects login payload with invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "User123!@#",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email address");
    }
  });

  it("rejects signup when passwords do not match", () => {
    const result = signupSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      number: "9812345678",
      password: "User123!@#",
      confirmPassword: "Mismatch123!@#",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === "Passwords do not match")).toBe(
        true,
      );
    }
  });

  it("rejects signup when phone has non-numeric characters", () => {
    const result = signupSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      number: "98A123",
      password: "User123!@#",
      confirmPassword: "User123!@#",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === "Phone number must contain only numbers")).toBe(
        true,
      );
    }
  });

  it("rejects forgot-password request with empty email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });

    expect(result.success).toBe(false);
  });

  it("rejects reset-password request without special character", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "Newpassword1",
      confirmPassword: "Newpassword1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.message === "Password must contain at least one special character",
        ),
      ).toBe(true);
    }
  });

  it("keeps module catalog ids unique", () => {
    const ids = AI_MODULE_CATALOG.map((item) => item.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it("ensures module catalog paths are absolute app/api paths", () => {
    const allValid = AI_MODULE_CATALOG.every(
      (item) => item.clientPath.startsWith("/") && item.apiPath.startsWith("/"),
    );

    expect(allValid).toBe(true);
  });

  it("contains at least one default active doctor", () => {
    const activeDoctors = AI_DOCTOR_CATALOG.filter((doctor) => doctor.defaultActive);

    expect(activeDoctors.length).toBeGreaterThan(0);
  });

  it("ensures each AI doctor has 5 guidance tags", () => {
    const allHaveFiveTags = AI_DOCTOR_CATALOG.every((doctor) => doctor.tags.length === 5);

    expect(allHaveFiveTags).toBe(true);
  });
});

