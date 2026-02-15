import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import type { VitalDataPoint } from "./types"

type VitalTrendsCardProps = {
  data: VitalDataPoint[]
  colors: {
    heartRate: string
    systolic: string
    glucose: string
  }
  stats?: { label: string; value: string; note: string }[]
}

export function VitalTrendsCard({ data, colors, stats = [] }: VitalTrendsCardProps) {
  const PRIMARY = "#1F7AE0";
  const chartColors = {
    heartRate: PRIMARY,
    systolic: PRIMARY,
    glucose: PRIMARY,
  };

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1.5 pb-2 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900">Vital Trends</CardTitle>
          <CardDescription className="mt-0.5 text-sm text-slate-500">
            Heart rate, blood pressure &amp; glucose from oldest to latest readings
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <ChartContainer
          className="h-56 w-full"
          config={{
            heartRate: { label: "Heart Rate (bpm)", color: chartColors.heartRate },
            systolic: { label: "Blood Pressure (systolic)", color: chartColors.systolic },
            glucose: { label: "Glucose (mg/dL)", color: chartColors.glucose },
          }}
        >
          <AreaChart data={data} margin={{ left: -10, right: 12, top: 12, bottom: 8 }}>
            <defs>
              <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.12} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.08} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.05} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickMargin={10}
            />
            <YAxis hide />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "#e2e8f0", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="heartRate"
              stroke={PRIMARY}
              fill="url(#heartRateGradient)"
              fillOpacity={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              connectNulls
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "white", stroke: PRIMARY }}
            />
            <Area
              type="monotone"
              dataKey="systolic"
              stroke={PRIMARY}
              fill="url(#systolicGradient)"
              fillOpacity={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              connectNulls
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "white", stroke: PRIMARY }}
              strokeOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="glucose"
              stroke={PRIMARY}
              fill="url(#glucoseGradient)"
              fillOpacity={1}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              connectNulls
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "white", stroke: PRIMARY }}
              strokeOpacity={0.4}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="mt-1.5 text-xl font-semibold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-[#1F7AE0]">{stat.note}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
