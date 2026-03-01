import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsightItem, SymptomDataPoint } from "./types"

type InsightsCardProps = {
  insights: InsightItem[]
  symptoms?: SymptomDataPoint[]
  vitals?: { label: string; value: string; note: string }[]
}

export function InsightsCard({
  insights,
  symptoms = [],
  vitals = [],
}: InsightsCardProps) {
  const topInsights = insights.slice(0, 2)
  const topSymptoms = [...symptoms]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 2)
  const topVitals = vitals.slice(0, 2)

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">Insights</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Signals from recent vitals and symptoms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {topInsights.length ? (
          topInsights.map((insight) => (
            <div key={insight.title} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{insight.title}</p>
                <span className="rounded-full bg-[#1F7AE0]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1F7AE0]">
                  Observation
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{insight.body}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-sm text-slate-500">
            No insights yet. Generate a risk assessment to unlock insights.
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current symptoms
            </p>
            {topSymptoms.length ? (
              <div className="mt-2 space-y-2">
                {topSymptoms.map((symptom) => (
                  <div key={symptom.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{symptom.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {symptom.frequency}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">No current symptoms logged.</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vitals snapshot
            </p>
            {topVitals.length ? (
              <div className="mt-2 space-y-2">
                {topVitals.map((vital) => (
                  <div key={vital.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{vital.label}</span>
                    <span className="font-medium text-slate-900">{vital.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">No vitals recorded yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
