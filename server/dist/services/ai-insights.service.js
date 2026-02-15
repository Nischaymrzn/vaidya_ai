"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiInsightsService = void 0;
const extractJsonArray = (value) => {
    const trimmed = value.trim();
    if (!trimmed)
        return null;
    try {
        return JSON.parse(trimmed);
    }
    catch {
        const start = trimmed.indexOf("[");
        const end = trimmed.lastIndexOf("]");
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(trimmed.slice(start, end + 1));
            }
            catch {
                return null;
            }
        }
        return null;
    }
};
class AiInsightsService {
    async generateInsights(input, maxItems = 3) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY");
        }
        const endpoint = process.env.GEMINI_API_URL ??
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        const prompt = `
You are a clinical insights assistant.
Return a JSON array only. Each item must have:
title, detail, level (High|Medium|Info), tag, source, time, action.
Keep it concise. Max ${maxItems} items.
Input:
${input}
`;
        const response = await fetch(`${endpoint}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini error: ${response.status} ${response.statusText} ${errorText}`);
        }
        const data = (await response.json());
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
        const parsed = extractJsonArray(text);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [
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
    }
}
exports.AiInsightsService = AiInsightsService;
