import { getGreeting } from "@/app/(protected)/dashboard/_components/greet";
import {
  buildCloudinaryPdfPreviewUrl,
  buildFileProxyUrl,
  formatFileSize,
  isImageAttachment,
  isPdfAttachment,
  normalizeCategoryLabel,
  parseDate,
  parseNumberField,
  parseSymptomList,
} from "@/app/(protected)/health-records/_lib/utils";
import {
  buildProviderNodes,
  formatNumber,
} from "@/app/(protected)/analytics/_lib/utils";
import { pageTitleMap } from "@/app/(protected)/_components/nav-items";
import { cn } from "@/lib/utils";

describe("Frontend unit logic", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("merges class names with cn", () => {
    expect(cn("p-2", "p-4", "text-sm")).toContain("p-4");
    expect(cn("p-2", "p-4", "text-sm")).not.toContain("p-2");
  });

  it("returns greeting based on current hour", () => {
    jest.spyOn(Date.prototype, "getHours").mockReturnValue(9);
    expect(getGreeting()).toBe("Good morning");

    jest.spyOn(Date.prototype, "getHours").mockReturnValue(15);
    expect(getGreeting()).toBe("Good afternoon");

    jest.spyOn(Date.prototype, "getHours").mockReturnValue(21);
    expect(getGreeting()).toBe("Good evening");
  });

  it("normalizes category labels from aliases and direct matches", () => {
    expect(normalizeCategoryLabel(" visits ")).toBe("Visit");
    expect(normalizeCategoryLabel("imaging")).toBe("Imaging");
    expect(normalizeCategoryLabel("Custom Category")).toBe("Custom Category");
    expect(normalizeCategoryLabel("")).toBeUndefined();
  });

  it("parses valid and invalid date values", () => {
    expect(parseDate("2026-03-01T10:00:00.000Z")).toBeInstanceOf(Date);
    expect(parseDate(new Date("2026-03-01"))).toBeInstanceOf(Date);
    expect(parseDate("invalid-date")).toBeNull();
    expect(parseDate()).toBeNull();
  });

  it("parses numeric and symptom list inputs", () => {
    expect(parseNumberField("42.5")).toBe(42.5);
    expect(parseNumberField("abc")).toBeUndefined();
    expect(parseSymptomList("headache, fever,  cough")).toEqual([
      "headache",
      "fever",
      "cough",
    ]);
    expect(parseSymptomList(" , ")).toBeUndefined();
  });

  it("formats file size and detects attachment types", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
    expect(formatFileSize(0)).toBe("Unknown size");

    expect(isPdfAttachment({ type: "application/pdf" })).toBe(true);
    expect(isPdfAttachment({ url: "https://x/y/report.pdf?dl=1" })).toBe(true);
    expect(isPdfAttachment({ url: "https://x/y/report.txt" })).toBe(false);

    expect(isImageAttachment({ type: "image/png" })).toBe(true);
    expect(isImageAttachment({ url: "https://x/y/img.jpg" })).toBe(true);
    expect(isImageAttachment({ url: "https://x/y/doc.pdf" })).toBe(false);
  });

  it("builds cloudinary preview and file proxy urls", () => {
    expect(
      buildCloudinaryPdfPreviewUrl(
        "https://res.cloudinary.com/demo/image/upload/v1/file.pdf",
      ),
    ).toBe("https://res.cloudinary.com/demo/image/upload/pg_1,f_jpg/v1/file.jpg");

    expect(
      buildCloudinaryPdfPreviewUrl("https://example.com/files/file.pdf"),
    ).toBeNull();

    expect(buildFileProxyUrl("https://cdn.example.com/r.pdf")).toContain(
      "/files?url=https%3A%2F%2Fcdn.example.com%2Fr.pdf",
    );
    expect(buildFileProxyUrl("https://cdn.example.com/r.pdf", true, "Report A")).toContain(
      "download=1&name=Report+A",
    );
  });

  it("formats analytics numbers and builds provider graph", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");

    const graph = buildProviderNodes([
      { name: "Provider A", count: 4 },
      { name: "Provider B", count: 2 },
      { name: "Provider C", count: 1 },
    ]);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.links).toHaveLength(3);
    expect(graph.nodes[0].id).toBe("provider-0");
    expect(graph.links[0]).toEqual({ from: "patient", to: "provider-0" });
  });

  it("contains expected navigation page title mappings", () => {
    expect(pageTitleMap.get("/dashboard")).toBe("Dashboard");
    expect(pageTitleMap.get("/health-intelligence/ai-doctors")).toBe("Vaidya Care");
    expect(pageTitleMap.get("/support")).toBe("Help Center");
  });
});

