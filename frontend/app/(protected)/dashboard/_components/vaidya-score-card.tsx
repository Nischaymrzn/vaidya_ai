import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import type { HealthScorePoint } from "./types"

type VaidyaScoreCardProps = {
  score: number
  trend: HealthScorePoint[]
}

export function VaidyaScoreCard({ score, trend }: VaidyaScoreCardProps) {
  return (
    <Card className="relative min-h-30 overflow-hidden border-slate-200/80 bg-white shadow-sm pt-4">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-b from-transparent to-cyan-100/90" />
      <CardContent className="relative z-10 flex flex-col gap-2 px-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[url('/score_bg.svg')] bg-cover bg-center text-2xl font-semibold text-slate-900 shadow-sm">
            {score}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">VAIDYA Score</p>
            <p className="text-xs leading-snug text-slate-600">
              Based on your data, we think your health status is above average
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="mt-1.5 rounded-md bg-cyan-200 px-3 py-1 text-[11px] font-semibold text-slate-900">
            Normal
          </span>
        </div>
        <div className="h-8 w-full">
          <ChartContainer
            className="h-full w-full"
            config={{
              score: { label: "Score", color: "#2f92b0" },
            }}
          >
            <AreaChart data={trend} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="healthScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#2f92b0"
                fill="url(#healthScoreGradient)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
