import crypto from "crypto";
import { HealthInsightRepository } from "../repositories/health-insight.repository";

type InsightItem = {
  title: string;
  detail: string;
  level: "High" | "Medium" | "Info";
  tag: string;
  source: string;
  time: string;
  action?: string;
};

const healthInsightRepository = new HealthInsightRepository();

const CACHE_CONTEXT = "records";
const DEFAULT_CACHE_HOURS = 6;

const normalizeCacheInput = (input: string) =>
  input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.toLowerCase().startsWith("today (local):"))
    .join("\n");

const buildContextHash = (input: string) =>
  crypto.createHash("sha256").update(input).digest("hex");

const mapDbToInsights = (items: { insightTitle?: string; description?: string; priority?: string; createdAt?: Date }[], maxItems: number): InsightItem[] =>
  items.slice(0, maxItems).map((item) => ({
    title: item.insightTitle ?? "Insight",
    detail: item.description ?? "Insight ready.",
    level: item.priority === "High" || item.priority === "Medium" || item.priority === "Info" ? item.priority : "Info",
    tag: "Summary",
    source: "AI",
    time: item.createdAt
      ? item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Recently",
    action: "Review",
  }));

const extractJsonArray = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
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

export class AiInsightsService {
  async generateInsights(
    userId: string,
    input: string,
    maxItems = 3,
    force = false,
  ) {
    const cacheInput = normalizeCacheInput(input);
    const contextHash = buildContextHash(cacheInput || input);
    const ttlHours = Number(process.env.AI_INSIGHTS_CACHE_HOURS ?? DEFAULT_CACHE_HOURS);
    const ttlMs = Math.max(1, ttlHours) * 60 * 60 * 1000;

    const cached = await healthInsightRepository.getByContext(
      userId,
      CACHE_CONTEXT,
      contextHash,
    );
    const latestCachedAt = cached[0]?.createdAt;
    const isCachedFresh =
      !!latestCachedAt && Date.now() - latestCachedAt.getTime() < ttlMs;

    if (!force && cached.length && isCachedFresh) {
      return mapDbToInsights(cached, maxItems);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const endpoint =
      process.env.GEMINI_API_URL ??
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const prompt = `
You are a clinical insights assistant.
Return a JSON array only. Each item must have:
title, detail, level (High|Medium|Info), tag, source, time, action.
Keep it concise. Max ${maxItems} items.
Input:
${input}
`;

    try {
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gemini error: ${response.status} ${response.statusText} ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      const parsed = extractJsonArray(text);

      const normalized = Array.isArray(parsed)
        ? (parsed as InsightItem[])
        : [
            {
              title: "Insights generated",
              detail: text || "No insights returned.",
              level: "Info",
              tag: "Summary",
              source: "AI",
              time: "Just now",
              action: "Review",
            },
          ];

      await healthInsightRepository.deleteByContext(
        userId,
        CACHE_CONTEXT,
        contextHash,
      );

      await healthInsightRepository.createMany(
        normalized.slice(0, maxItems).map((item) => ({
          userId,
          insightTitle: item.title,
          description: item.detail,
          priority:
            item.level === "High" || item.level === "Medium" || item.level === "Info"
              ? item.level
              : "Info",
          contextType: CACHE_CONTEXT,
          contextHash,
        })),
      );

      return normalized.slice(0, maxItems);
    } catch (error) {
      if (cached.length) {
        return mapDbToInsights(cached, maxItems);
      }
      throw error;
    }
  }
}
