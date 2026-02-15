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

type ImmunizationsProps = {
  data: AnalyticsSummary["immunizationHistory"];
  hasData: boolean;
};

export default function Immunizations({ data, hasData }: ImmunizationsProps) {
  const PRIMARY = "#1F7AE0";
  
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-5">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Immunization history</CardTitle>
        <CardDescription className="text-sm text-slate-500">Monthly vaccination activity by type.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            className="h-64 w-full"
            config={{
              routine: { label: "Routine", color: PRIMARY },
              booster: { label: "Booster", color: PRIMARY },
              travel: { label: "Travel", color: PRIMARY },
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
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="routine" stackId="immun" fill={PRIMARY} fillOpacity={0.9} radius={[8, 8, 0, 0]} />
              <Bar dataKey="booster" stackId="immun" fill={PRIMARY} fillOpacity={0.6} />
              <Bar dataKey="travel" stackId="immun" fill={PRIMARY} fillOpacity={0.4} radius={[0, 0, 8, 8]} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        ) : (
          <Empty label="No immunization data available yet." />
        )}
      </CardContent>
    </Card>
  );
}
