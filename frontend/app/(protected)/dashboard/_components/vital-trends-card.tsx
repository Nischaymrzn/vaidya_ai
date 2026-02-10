import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
}

export function VitalTrendsCard({ data, colors }: VitalTrendsCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-3 pb-0 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Vital Trends</CardTitle>
          <CardDescription className="mt-0 text-xs text-muted-foreground">
            Heart rate, blood pressure &amp; glucose over the past week
          </CardDescription>
        </div>
        <Tabs defaultValue="7d">
          <TabsList className="grid grid-cols-4 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200/70">
            <TabsTrigger value="7d" className="rounded-full text-xs">
              7D
            </TabsTrigger>
            <TabsTrigger value="30d" className="rounded-full text-xs">
              30D
            </TabsTrigger>
            <TabsTrigger value="90d" className="rounded-full text-xs">
              90D
            </TabsTrigger>
            <TabsTrigger value="1y" className="rounded-full text-xs">
              1Y
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <ChartContainer
          className="h-60 w-full"
          config={{
            heartRate: { label: "Heart Rate (bpm)", color: colors.heartRate },
            systolic: { label: "Blood Pressure", color: colors.systolic },
            glucose: { label: "Glucose (mg/dL)", color: colors.glucose },
          }}
        >
          <AreaChart data={data} margin={{ left: -10, right: 12, top: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.heartRate} stopOpacity={0.35} />
                <stop offset="100%" stopColor={colors.heartRate} stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.systolic} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.systolic} stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.glucose} stopOpacity={0.28} />
                <stop offset="100%" stopColor={colors.glucose} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              strokeOpacity={0.5}
            />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis hide />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="heartRate"
              stroke={colors.heartRate}
              fill="url(#heartRateGradient)"
              fillOpacity={1}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "white" }}
            />
            <Area
              type="monotone"
              dataKey="systolic"
              stroke={colors.systolic}
              fill="url(#systolicGradient)"
              fillOpacity={1}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "white" }}
            />
            <Area
              type="monotone"
              dataKey="glucose"
              stroke={colors.glucose}
              fill="url(#glucoseGradient)"
              fillOpacity={1}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "white" }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Avg Heart Rate", value: "74 bpm", note: "+2 vs last week" },
            { label: "BP Average", value: "118 / 78", note: "Stable" },
            { label: "Glucose Avg", value: "101 mg/dL", note: "2 mild spikes" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
              <p className="mt-0 text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">{stat.value}</p>
              <p className="mt-0 text-xs font-medium text-blue-700">{stat.note}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
