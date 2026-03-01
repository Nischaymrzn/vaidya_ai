"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

type ChartDatum = {
  name: string;
  count: number;
};

type SymptomsChartCardProps = {
  data: ChartDatum[];
  primaryColor: string;
  title?: string;
  description?: string;
  emptyMessage?: string;
  heightClassName?: string;
};

export function SymptomsChartCard({
  data,
  primaryColor,
  title = "Top 3 frequent symptoms",
  description = "Most logged symptom types",
  emptyMessage = "No symptom trends yet",
  heightClassName = "h-44",
}: SymptomsChartCardProps) {
  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          {title}
        </CardTitle>
        <CardDescription className="mt-0.5 text-sm text-slate-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0.5">
        {data.length ? (
          <ChartContainer
            config={{
              count: {
                label: "Count",
                color: primaryColor,
              },
            }}
            className={`${heightClassName} w-full aspect-auto`}
          >
            <BarChart
              data={data}
              margin={{ top: 8, right: 0, bottom: 18, left: 0 }}
              barCategoryGap={18}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickMargin={8}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="count" fill={primaryColor} radius={[10, 10, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
