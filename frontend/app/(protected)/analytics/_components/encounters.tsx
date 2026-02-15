import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AnalyticsSummary } from "@/lib/definition";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { PALETTE } from "../_lib/palette";
import { formatNumber } from "../_lib/utils";
import Empty from "./empty";

type EncountersProps = {
  history: AnalyticsSummary["encounterHistory"];
  totals: AnalyticsSummary["encounterTotals"];
  hasData: boolean;
};

export default function Encounters({ history, totals, hasData }: EncountersProps) {
  const PRIMARY = "#1F7AE0";
  
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-8">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Encounter volume by month</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Outpatient, telehealth, and inpatient activity across the selected period.
        </CardDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="bg-[#1F7AE0]/10 text-[#1F7AE0]">
            Outpatient {formatNumber(totals.outpatient)}
          </Badge>
          <Badge variant="secondary" className="bg-[#1F7AE0]/10 text-[#1F7AE0]">
            Telehealth {formatNumber(totals.telehealth)}
          </Badge>
          <Badge variant="secondary" className="bg-[#1F7AE0]/10 text-[#1F7AE0]">
            Inpatient {formatNumber(totals.inpatient)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            className="h-72 w-full"
            config={{
              outpatient: { label: "Outpatient", color: PRIMARY },
              telehealth: { label: "Telehealth", color: PRIMARY },
              inpatient: { label: "Inpatient", color: PRIMARY },
            }}
          >
            <AreaChart data={history} margin={{ left: -16, right: 12, top: 12, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickMargin={10}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="outpatient"
                stroke={PRIMARY}
                fill={PRIMARY}
                fillOpacity={0.12}
                strokeWidth={1.5}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="telehealth"
                stroke={PRIMARY}
                fill={PRIMARY}
                fillOpacity={0.08}
                strokeWidth={1.5}
                strokeOpacity={0.6}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="inpatient"
                stroke={PRIMARY}
                strokeWidth={1.5}
                strokeOpacity={0.4}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: "white", strokeWidth: 2, stroke: PRIMARY }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <Empty label="Log medical records to see encounter trends." />
        )}
      </CardContent>
    </Card>
  );
}
