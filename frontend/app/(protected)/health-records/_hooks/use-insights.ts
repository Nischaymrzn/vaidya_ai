import { useCallback, useEffect, useRef, useState } from "react"
import { generateAiInsights } from "@/lib/actions/ai-action"
import type { TMedicalRecord } from "@/lib/definition"
import { buildFallbackInsights, buildInsightsInput } from "../_lib/insights"
import type { InsightItem } from "../_lib/types"
import { formatDate } from "../_lib/utils"

const INSIGHTS_TTL_MS = 6 * 60 * 60 * 1000

export const useInsights = (records: TMedicalRecord[], enabled: boolean) => {
  const [aiInsights, setAiInsights] = useState<InsightItem[]>([])
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false)
  const [aiInsightsError, setAiInsightsError] = useState<string | null>(null)
  const [insightsUpdatedAt, setInsightsUpdatedAt] = useState<Date | null>(null)
  const lastInsightsInputRef = useRef<string>("")
  const lastInsightsRunAtRef = useRef<number>(0)

  const refreshAiInsights = useCallback(
    async (force = false) => {
      const input = buildInsightsInput(records)
      if (!input) {
        lastInsightsInputRef.current = ""
        lastInsightsRunAtRef.current = Date.now()
        setAiInsights(buildFallbackInsights(records))
        setAiInsightsError(null)
        setInsightsUpdatedAt(new Date())
        return
      }

      if (
        !force &&
        lastInsightsInputRef.current === input &&
        Date.now() - lastInsightsRunAtRef.current < INSIGHTS_TTL_MS
      ) {
        return
      }

      lastInsightsInputRef.current = input
      setAiInsightsLoading(true)
      setAiInsightsError(null)
      try {
        const res = await generateAiInsights(input, 2, force)
        if (res.success && Array.isArray(res.data)) {
          const normalized = res.data
            .filter((item): item is InsightItem => !!item?.title)
            .map((item) => ({
              title: item.title,
              detail: item.detail || "Insight ready.",
              level:
                item.level === "High" || item.level === "Medium" || item.level === "Info"
                  ? item.level
                  : "Info",
              tag: item.tag || "Summary",
              source: item.source || "AI",
              time: item.time || "Just now",
              action: item.action,
            }))
          const cleaned = normalized.filter((item) => {
            const combined = `${item.title} ${item.detail}`.toLowerCase()
            const normalizedText = combined.replace(/[^a-z0-9]+/g, " ")
            if (normalizedText.includes("future dated")) return false
            if (normalizedText.includes("future date")) return false
            if (normalizedText.includes("future records")) return false
            return true
          })
          const trimmed = cleaned.slice(0, 2)
          setAiInsights(
            trimmed.length ? trimmed : buildFallbackInsights(records).slice(0, 2)
          )
        } else {
          setAiInsights(buildFallbackInsights(records).slice(0, 2))
          setAiInsightsError(res.message || "Insights unavailable")
        }
      } catch (error: Error | any) {
        setAiInsights(buildFallbackInsights(records).slice(0, 2))
        setAiInsightsError(error?.message || "Insights unavailable")
      } finally {
        lastInsightsRunAtRef.current = Date.now()
        setInsightsUpdatedAt(new Date())
        setAiInsightsLoading(false)
      }
    },
    [records]
  )

  useEffect(() => {
    if (!enabled) return
    refreshAiInsights()
  }, [enabled, refreshAiInsights])

  return {
    aiInsights,
    aiInsightsLoading,
    aiInsightsError,
    insightsUpdatedAt,
    refreshAiInsights,
    formatUpdatedAt: (value?: Date | null) =>
      value ? formatDate(value.toISOString()) : "N/A",
  }
}
