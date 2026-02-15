import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import type { HealthScorePoint } from "./types"

type VaidyaScoreCardProps = {
  score?: number
  trend: HealthScorePoint[]
}

export function VaidyaScoreCard({ score, trend }: VaidyaScoreCardProps) {
  const hasScore = typeof score === "number" && Number.isFinite(score)
  const displayScore = hasScore ? Math.round(score) : "--"
  const label = hasScore
    ? score >= 80
      ? "Great"
      : score >= 65
        ? "Normal"
        : score >= 45
          ? "Watch"
          : "High risk"
    : "No data"

  return (
    <Card className="relative min-h-30 overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm pt-4">
      <CardContent className="relative z-10 flex flex-col gap-3 px-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[url('/score_bg.svg')] bg-cover bg-center text-2xl font-semibold text-slate-900 shadow-sm">
            {displayScore}
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-slate-900">VAIDYA Score</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {hasScore
                ? "Based on your data, we think your health status is above average"
                : "Add vitals and symptoms to generate your score"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#1F7AE0]/10 px-3 py-1 text-xs font-semibold text-[#1F7AE0]">
            {label}
          </span>
        </div>
        <div className="h-10 w-full">
          <ChartContainer
            className="h-full w-full"
            config={{
              score: { label: "Score", color: "#1F7AE0" },
            }}
          >
            <AreaChart data={trend} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="healthScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F7AE0" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#1F7AE0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#1F7AE0"
                fill="url(#healthScoreGradient)"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
