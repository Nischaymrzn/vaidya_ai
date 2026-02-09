import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InsightItem } from "./types"

type InsightsCardProps = {
  insights: InsightItem[]
}

export function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0 pb-0">
        <CardTitle className="mb-0 text-base font-semibold">Insights</CardTitle>
        <CardDescription className="mt-0 text-xs text-muted-foreground">
          Recent observations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {insights.map((insight) => (
          <div key={insight.title} className="rounded-xl border border-blue-100/60 bg-blue-50/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{insight.title}</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Observation
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{insight.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
