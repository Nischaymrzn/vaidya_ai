import { createWorker } from "tesseract.js";

type StructuredResult = Record<string, unknown>;

const normalizeRecordType = (recordType?: string) =>
  recordType?.trim().toLowerCase();

const parseNumber = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseVitals = (text: string): StructuredResult => {
  const result: StructuredResult = {};

  const bpMatch = text.match(/(\d{2,3})\s*[/\-]\s*(\d{2,3})\s*(?:mmhg)?/i);
  if (bpMatch) {
    result.systolicBp = parseNumber(bpMatch[1]);
    result.diastolicBp = parseNumber(bpMatch[2]);
  }

  const hrMatch =
    text.match(/(?:heart rate|hr)\s*[:\-]?\s*(\d{2,3})/i) ||
    text.match(/(\d{2,3})\s*bpm/i);
  if (hrMatch) {
    result.heartRate = parseNumber(hrMatch[1]);
  }

  const glucoseMatch = text.match(
    /(?:glucose|blood sugar)\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)/i,
  );
  if (glucoseMatch) {
    result.glucoseLevel = parseNumber(glucoseMatch[1]);
  }

  const weightMatch = text.match(/(\d{2,3}(?:\.\d+)?)\s*kg/i);
  if (weightMatch) {
    result.weight = parseNumber(weightMatch[1]);
  }

  const heightMatch = text.match(/(\d{2,3}(?:\.\d+)?)\s*cm/i);
  if (heightMatch) {
    result.height = parseNumber(heightMatch[1]);
  }

  const bmiMatch = text.match(/(?:bmi)\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)/i);
  if (bmiMatch) {
    result.bmi = parseNumber(bmiMatch[1]);
  }

  return result;
};

const inferRecordType = (text: string): string | undefined => {
  if (text.match(/(\d{2,3})\s*[/\-]\s*(\d{2,3})\s*(?:mmhg)?/i)) {
    return "Vitals";
  }
  return undefined;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const buildSummary = (
  recordType?: string,
  structured?: StructuredResult,
  text?: string,
) => {
  const normalizedType = normalizeRecordType(recordType);
  const data = structured ?? {};
  const parts: string[] = [];

  if (normalizedType === "vitals") {
    const systolic = formatValue(data.systolicBp);
    const diastolic = formatValue(data.diastolicBp);
    if (systolic && diastolic) {
      parts.push(`BP ${systolic}/${diastolic} mmHg`);
    }
    const hr = formatValue(data.heartRate);
    if (hr) parts.push(`Heart rate ${hr} bpm`);
    const glucose = formatValue(data.glucoseLevel);
    if (glucose) parts.push(`Glucose ${glucose}`);
    const weight = formatValue(data.weight);
    if (weight) parts.push(`Weight ${weight} kg`);
    const height = formatValue(data.height);
    if (height) parts.push(`Height ${height} cm`);
    const bmi = formatValue(data.bmi);
    if (bmi) parts.push(`BMI ${bmi}`);

    if (parts.length) {
      return `Vitals captured: ${parts.join(", ")}`;
    }
  }

  const lines = (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.length > 6)
    .filter((line) => /[a-z]/i.test(line))
    .filter(
      (line) =>
        !/(patient details|s\.no|testname|interpretation|normal range|consult doctor)/i.test(
          line,
        ),
    );

  if (lines.length) {
    const summaryLine = lines[0];
    return summaryLine.length > 160
      ? `${summaryLine.slice(0, 157)}...`
      : summaryLine;
  }

  return undefined;
};

const parseIsoDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
};

const extractDate = (text: string) => {
  const isoMatch = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (isoMatch) {
    const [_, y, m, d] = isoMatch;
    const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return parseIsoDate(iso) ?? iso;
  }

  const dmyMatch = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return parseIsoDate(iso) ?? iso;
  }

  const monthMatch = text.match(
    /\b(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s*(20\d{2})\b/i,
  );
  if (monthMatch) {
    const [_, d, mon, y] = monthMatch;
    const iso = parseIsoDate(`${d} ${mon} ${y}`);
    if (iso) return iso;
  }

  return undefined;
};

const extractProvider = (text: string) => {
  const urlMatch = text.match(
    /\b(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})\b/i,
  );
  if (urlMatch?.[1]) {
    return urlMatch[1].replace(/^www\./i, "");
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const providerLine = lines.find((line) =>
    /(hospital|clinic|lab|diagnostic|diagnostics|medical|health center|health centre)/i.test(
      line,
    ),
  );
  return providerLine;
};

const isLikelyBadProvider = (value?: string) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.length < 3) return true;
  const badTokens = [
    "s.no",
    "s no",
    "testname",
    "test name",
    "result",
    "interpretation",
    "patient details",
    "patient detail",
    "name",
    "age",
    "gender",
    "height",
    "weight",
    "blood pressure",
    "bp status",
    "vitals",
  ];
  if (badTokens.some((token) => normalized.includes(token))) return true;
  const alphaCount = normalized.replace(/[^a-z]/g, "").length;
  if (alphaCount < 2) return true;
  return false;
};

const extractJson = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const buildExtractionPrompt = (text: string, recordType?: string) => {
  const typeLine = recordType
    ? `The recordType is "${recordType}". Only extract fields for that type.`
    : "If you can infer the recordType, set it.";
  return `
You are a medical data extraction system.
Return JSON only.
Output format:
{
  "recordType": "Vitals|Prescription|Diagnosis|Visit|Imaging|Allergy|Immunization",
  "provider": "string",
  "recordDate": "YYYY-MM-DD",
  "structured": { ... }
}

Allowed fields by type:
Vitals: systolicBp, diastolicBp, heartRate, glucoseLevel, weight, height, bmi, recordedAt
Prescription: medicineName, dosage, frequency, durationDays, startDate, endDate, purpose, diagnosis, disease, notes
Diagnosis/Visit: symptomList (array), severity, status, durationDays, notes, diagnosis, disease, loggedAt
Allergy: allergen, type, reaction, severity, status, onsetDate, recordedAt, notes
Immunization: vaccineName, date, doseNumber, series, manufacturer, lotNumber, site, route, provider, nextDue, notes

${typeLine}
If a value is missing, omit the field.

OCR text:
${text}
`;
};

const runGemini = async (prompt: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "";

  const endpoint =
    process.env.GEMINI_API_URL ??
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS ?? "20000");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gemini error: ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } finally {
    clearTimeout(timeout);
  }
};

export class AiScanService {
  async scanImage(buffer: Buffer, recordType?: string) {
    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(buffer);
    await worker.terminate();

    const normalizedText = (text ?? "").trim();
    const normalizedType = normalizeRecordType(recordType);
    let structured: StructuredResult = {};
    let finalType = recordType ?? inferRecordType(normalizedText);
    let provider: string | undefined;
    let recordDate: string | undefined;
    let summary: string | undefined;

    const useLlm = process.env.AI_SCAN_USE_LLM !== "false";
    if (useLlm && normalizedText) {
      try {
        const prompt = buildExtractionPrompt(normalizedText, recordType);
        const llmResponse = await runGemini(prompt);
        const parsed = extractJson(llmResponse) as
          | {
              recordType?: string;
              structured?: StructuredResult;
              provider?: string;
              recordDate?: string;
            }
          | null;
        if (parsed?.structured) structured = parsed.structured;
        if (parsed?.recordType) finalType = parsed.recordType;
        if (parsed?.provider && !isLikelyBadProvider(parsed.provider)) {
          provider = parsed.provider;
        }
        if (parsed?.recordDate) recordDate = parsed.recordDate;
      } catch {
        // Fall back to regex parsing.
      }
    }

    if (!Object.keys(structured).length) {
      const fallbackType = normalizeRecordType(finalType) ?? normalizedType;
      if (fallbackType === "vitals") structured = parseVitals(normalizedText);
    }

    if (!provider) {
      const extracted = extractProvider(normalizedText);
      provider = isLikelyBadProvider(extracted) ? undefined : extracted;
    }
    if (!recordDate) recordDate = extractDate(normalizedText);

    summary = buildSummary(finalType, structured, normalizedText);

    return {
      text: normalizedText,
      recordType: finalType,
      provider,
      recordDate,
      summary,
      structured,
    };
  }
}
