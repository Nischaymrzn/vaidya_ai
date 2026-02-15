"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

type ChartDatum = {
  name: string;
  count: number;
};

type SymptomsChartCardProps = {
  data: ChartDatum[];
  primaryColor: string;
};

export function SymptomsChartCard({ data, primaryColor }: SymptomsChartCardProps) {
  if (!data.length) return null;

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-4">
        <CardTitle className="text-base font-semibold text-slate-900">
          Most Frequent
        </CardTitle>
        <CardDescription className="mt-0.5 text-sm text-slate-500">
          Your common symptoms
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer
          config={{
            count: {
              label: "Count",
              color: primaryColor,
            },
          }}
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e2e8f0"
                strokeOpacity={0.5}
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="count" fill={primaryColor} radius={[0, 8, 8, 0]} fillOpacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
