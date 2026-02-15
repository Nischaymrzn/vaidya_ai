import type { TMedicalRecord } from "@/lib/definition"
import type { InsightItem } from "./types"
import { normalizeCategoryLabel, parseDate, todayLocalISO } from "./utils"

export const buildInsightsInput = (records: TMedicalRecord[]) => {
  if (!records.length) return ""
  const total = records.length
  const aiProcessed = records.filter((record) => record.aiScanned).length
  const providerCount = new Set(
    records
      .map((record) => record.provider?.trim())
      .filter((provider) => provider)
  ).size

  const categoryCounts = new Map<string, number>()
  records.forEach((record) => {
    const label =
      normalizeCategoryLabel(record.category || record.recordType) ?? "Other"
    categoryCounts.set(label, (categoryCounts.get(label) ?? 0) + 1)
  })

  const categorySummary = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => `${label}: ${count}`)
    .join(", ")

  const recentRecords = [...records]
    .sort((a, b) => {
      const dateA = parseDate(a.recordDate || a.updatedAt || a.createdAt)
      const dateB = parseDate(b.recordDate || b.updatedAt || b.createdAt)
      return (dateB?.getTime() ?? 0) - (dateA?.getTime() ?? 0)
    })
    .slice(0, 6)
    .map((record) => {
      const dateLabel = record.recordDate?.slice(0, 10) ?? "Unknown date"
      const typeLabel =
        normalizeCategoryLabel(record.category || record.recordType) ?? "Record"
      const providerLabel = record.provider?.trim() || "Unknown provider"
      return `- ${record.title || "Untitled"} | ${typeLabel} | ${dateLabel} | ${providerLabel}`
    })
    .join("\n")

  return [
    `Records summary: total ${total}, AI processed ${aiProcessed}, providers ${providerCount}.`,
    `Today (local): ${todayLocalISO()}.`,
    categorySummary ? `Categories: ${categorySummary}.` : "",
    recentRecords ? `Recent records:\n${recentRecords}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export const buildFallbackInsights = (records: TMedicalRecord[]): InsightItem[] => {
  if (!records.length) {
    return [
      {
        title: "No records yet",
        detail: "Upload or add a record to unlock insights.",
        level: "Info",
        tag: "Summary",
        source: "Records",
        time: "Just now",
        action: "Add record",
      },
    ]
  }

  const insights: InsightItem[] = []
  const pendingAi = records.filter(
    (record) =>
      record.aiScanned &&
      record.status !== "Verified" &&
      record.status !== "Reviewed"
  ).length
  if (pendingAi) {
    insights.push({
      title: "AI reviews pending",
      detail: `${pendingAi} AI scanned records need your review.`,
      level: "Medium",
      tag: "Review",
      source: "Records",
      time: "Today",
      action: "Review",
    })
  }

  const missingProviders = records.filter((record) => !record.provider).length
  if (missingProviders) {
    insights.push({
      title: "Missing provider info",
      detail: `${missingProviders} records are missing provider details.`,
      level: "Info",
      tag: "Cleanup",
      source: "Records",
      time: "Today",
      action: "Update",
    })
  }

  const last90Days = new Date()
  last90Days.setDate(last90Days.getDate() - 90)
  const recentCount = records.filter((record) => {
    const date = parseDate(record.recordDate || record.updatedAt || record.createdAt)
    return date ? date >= last90Days : false
  }).length
  if (recentCount === 0) {
    insights.push({
      title: "No recent uploads",
      detail: "There are no records in the last 90 days.",
      level: "High",
      tag: "Gap",
      source: "Records",
      time: "Today",
      action: "Add record",
    })
  }

  if (!insights.length) {
    insights.push({
      title: "Records in good shape",
      detail: "Your recent uploads look complete and up to date.",
      level: "Info",
      tag: "Summary",
      source: "Records",
      time: "Today",
      action: "View",
    })
  }

  return insights.slice(0, 3)
}
