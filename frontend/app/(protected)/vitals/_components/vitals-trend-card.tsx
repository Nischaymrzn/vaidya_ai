import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { VitalsTrendPoint } from "@/lib/definition";

const PRIMARY = "#1F7AE0";

type VitalsTrendCardProps = {
  data: VitalsTrendPoint[];
  stats?: { label: string; value: string; note: string }[];
};

export function VitalsTrendCard({ data, stats = [] }: VitalsTrendCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm ring-1 ring-primary/5">
      <CardHeader className="flex flex-col gap-1.5 pb-2 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-base font-semibold text-slate-900">
          Trend Overview
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Heart rate, blood pressure &amp; glucose from oldest to latest readings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 pt-0">
        <ChartContainer
          className="h-40 w-full md:h-44"
          config={{
            heartRate: { label: "Heart Rate", color: PRIMARY },
            systolic: { label: "Blood Pressure (systolic)", color: PRIMARY },
            glucose: { label: "Glucose", color: PRIMARY },
          }}
        >
          <AreaChart data={data} margin={{ left: -10, right: 12, top: 12, bottom: 8 }}>
            <defs>
              <linearGradient id="vitalsHeartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.12} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vitalsSystolicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.08} />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vitalsGlucoseGradient" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="label"
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
              fill="url(#vitalsHeartGradient)"
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
              fill="url(#vitalsSystolicGradient)"
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
              fill="url(#vitalsGlucoseGradient)"
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

        {stats.length ? (
          <div className="grid gap-2.5 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-base font-semibold text-slate-900">{stat.value}</p>
                <p className="text-[10px] font-medium text-primary/80">{stat.note}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
