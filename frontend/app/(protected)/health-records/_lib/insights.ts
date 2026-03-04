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
      detail: `${pendingAi} AI scanned records still need verification.`,
      level: "Medium",
      tag: "Review",
      source: "Records",
      time: "Today",
      action: "Review",
    })
  }

  const missingProviders = records.filter((record) => !record.provider?.trim()).length
  const missingDates = records.filter((record) => !record.recordDate).length
  const incompleteCount = missingProviders + missingDates
  if (incompleteCount) {
    const detailParts = []
    if (missingDates) detailParts.push(`${missingDates} missing dates`)
    if (missingProviders) detailParts.push(`${missingProviders} missing provider info`)
    insights.push({
      title: "Incomplete record details",
      detail: `${detailParts.join(" or ")}.`,
      level: incompleteCount >= 3 ? "High" : "Medium",
      tag: "Cleanup",
      source: "Records",
      time: "Today",
      action: "Update",
    })
  }

  const ongoingSymptomsCount = records.filter((record) => {
    const structured = record.structuredData
    if (!structured || typeof structured !== "object") return false
    const statusValue =
      typeof structured.status === "string"
        ? structured.status
        : typeof (structured as Record<string, unknown>).symptomStatus === "string"
          ? (structured as Record<string, unknown>).symptomStatus
          : ""
    const normalizedStatus =
      typeof statusValue === "string" ? statusValue.toLowerCase() : ""
    return normalizedStatus === "ongoing"
  }).length
  if (ongoingSymptomsCount) {
    insights.push({
      title: "Ongoing symptoms logged",
      detail: `${ongoingSymptomsCount} records include symptoms marked as ongoing.`,
      level: ongoingSymptomsCount >= 3 ? "Medium" : "Info",
      tag: "Symptoms",
      source: "Records",
      time: "Today",
      action: "Review",
    })
  }

  const missingAttachments = records.filter((record) => !record.attachments?.length).length
  if (missingAttachments) {
    insights.push({
      title: "Records without attachments",
      detail: `${missingAttachments} records have no files attached.`,
      level: "Info",
      tag: "Cleanup",
      source: "Records",
      time: "Today",
      action: "Add file",
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
