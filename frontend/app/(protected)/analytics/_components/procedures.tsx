import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { AnalyticsSummary } from "@/lib/definition";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PALETTE } from "../_lib/palette";
import Empty from "./empty";

type ProceduresProps = {
  data: AnalyticsSummary["procedureBreakdown"];
  hasData: boolean;
};

export default function Procedures({ data, hasData }: ProceduresProps) {
  const PRIMARY = "#1F7AE0";
  
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-7">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Procedures overview</CardTitle>
        <CardDescription className="text-sm text-slate-500">Procedure volume grouped by category.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            className="h-72 w-full"
            config={{
              count: { label: "Procedures", color: PRIMARY },
            }}
          >
            <BarChart data={data} margin={{ left: -16, right: 16, top: 12, bottom: 8 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickMargin={10}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill={PRIMARY} fillOpacity={0.9} />
            </BarChart>
          </ChartContainer>
        ) : (
          <Empty label="Upload lab results and records to see procedures." />
        )}
      </CardContent>
    </Card>
  );
}
