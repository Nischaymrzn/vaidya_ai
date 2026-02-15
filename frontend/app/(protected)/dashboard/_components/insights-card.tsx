import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsightItem } from "./types"

type InsightsCardProps = {
  insights: InsightItem[]
}

export function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">Insights</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Recent observations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {insights.length ? (
          insights.map((insight) => (
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
      </CardContent>
    </Card>
  )
}
