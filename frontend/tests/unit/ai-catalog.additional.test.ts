import { API } from "@/lib/api/endpoints";
import { AI_DOCTOR_CATALOG, AI_MODULE_CATALOG } from "@/lib/ai-catalog";

describe("AI catalog and endpoint additional unit coverage", () => {
  it("keeps module catalog non-empty", () => {
    expect(AI_MODULE_CATALOG.length).toBeGreaterThan(0);
  });

  it("keeps module ids unique", () => {
    const ids = AI_MODULE_CATALOG.map((module) => module.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps module versions in semver-like format", () => {
    const semverLike = /^\d+\.\d+\.\d+$/;
    expect(AI_MODULE_CATALOG.every((module) => semverLike.test(module.defaultVersion))).toBe(true);
  });

  it("keeps module client paths absolute", () => {
    expect(AI_MODULE_CATALOG.every((module) => module.clientPath.startsWith("/"))).toBe(true);
  });

  it("keeps module categories within allowed enum", () => {
    const allowed = new Set(["Prediction", "Assistant", "Analysis", "Scan"]);
    expect(AI_MODULE_CATALOG.every((module) => allowed.has(module.category))).toBe(true);
  });

  it("exposes payments endpoints", () => {
    expect(API.PAYMENTS.STATUS).toBe("/payments/status");
    expect(API.PAYMENTS.CHECKOUT_SESSION).toBe("/payments/checkout-session");
    expect(API.PAYMENTS.WEBHOOK).toBe("/payments/webhook");
  });

  it("keeps doctor catalog non-empty and titled as doctors", () => {
    expect(AI_DOCTOR_CATALOG.length).toBeGreaterThan(0);
    expect(AI_DOCTOR_CATALOG.every((doctor) => doctor.name.startsWith("Dr."))).toBe(true);
  });

  it("keeps doctor ids unique", () => {
    const ids = AI_DOCTOR_CATALOG.map((doctor) => doctor.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps exactly five unique tags per doctor", () => {
    const valid = AI_DOCTOR_CATALOG.every((doctor) => {
      const uniqueTags = new Set(doctor.tags);
      return doctor.tags.length === 5 && uniqueTags.size === 5;
    });
    expect(valid).toBe(true);
  });

  it("keeps doctor image paths in supported formats", () => {
    const imagePattern = /^\/.+\.(png|jpg|jpeg|webp|svg)$/i;
    expect(AI_DOCTOR_CATALOG.every((doctor) => imagePattern.test(doctor.image))).toBe(true);
  });
});

