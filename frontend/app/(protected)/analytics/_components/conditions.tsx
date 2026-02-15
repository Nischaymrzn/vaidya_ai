import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { AnalyticsSummary } from "@/lib/definition";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { PALETTE } from "../_lib/palette";
import Empty from "./empty";

type ConditionsProps = {
  data: AnalyticsSummary["topConditions"];
  hasData: boolean;
};

export default function Conditions({ data, hasData }: ConditionsProps) {
  const PRIMARY = "#1F7AE0";
  
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-5">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Most frequent conditions</CardTitle>
        <CardDescription className="text-sm text-slate-500">Top diagnoses across the record.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            className="h-72 w-full"
            config={{
              count: { label: "Cases", color: PRIMARY },
            }}
          >
            <BarChart data={data} layout="vertical" margin={{ left: 20, top: 8, bottom: 8 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 13, fill: "#64748b" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {data.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill={PRIMARY}
                    opacity={index < 3 ? 0.9 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <Empty label="Record diagnoses to see condition trends." />
        )}
      </CardContent>
    </Card>
  );
}
