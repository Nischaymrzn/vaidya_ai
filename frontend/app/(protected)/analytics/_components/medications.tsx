import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AnalyticsSummary } from "@/lib/definition";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PALETTE } from "../_lib/palette";
import Empty from "./empty";

type MedicationsProps = {
  data: AnalyticsSummary["medicationHistory"];
  hasData: boolean;
};

export default function Medications({ data, hasData }: MedicationsProps) {
  const PRIMARY = "#1F7AE0";
  
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-7">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Medication history</CardTitle>
        <CardDescription className="text-sm text-slate-500">Active, new, and discontinued medications by month.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            className="h-72 w-full"
            config={{
              active: { label: "Active", color: PRIMARY },
              new: { label: "New", color: PRIMARY },
              stopped: { label: "Stopped", color: PALETTE.slate },
            }}
          >
            <BarChart data={data} margin={{ left: -12, right: 12, top: 12, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickMargin={10}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Bar dataKey="active" stackId="meds" fill={PRIMARY} fillOpacity={0.9} radius={[8, 8, 0, 0]} />
              <Bar dataKey="new" stackId="meds" fill={PRIMARY} fillOpacity={0.6} />
              <Bar dataKey="stopped" stackId="meds" fill={PALETTE.slate} fillOpacity={0.6} radius={[0, 0, 8, 8]} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        ) : (
          <Empty label="Add medications to track activity." />
        )}
      </CardContent>
    </Card>
  );
}
