import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AnalyticsSummary } from "@/lib/definition";
import { Cell, Pie, PieChart } from "recharts";
import { PALETTE, severityColors } from "../_lib/palette";
import Empty from "./empty";

type AllergiesProps = {
  data: AnalyticsSummary["allergySeverity"];
  hasData: boolean;
};

export default function Allergies({ data, hasData }: AllergiesProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Allergy severity</CardTitle>
        <CardDescription className="text-sm text-slate-500">Distribution of recorded allergy severities.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer
            className="h-64 w-full"
            config={{
              Mild: { label: "Mild", color: severityColors.Mild },
              Moderate: { label: "Moderate", color: severityColors.Moderate },
              Severe: { label: "Severe", color: severityColors.Severe },
              Unspecified: { label: "Unspecified", color: severityColors.Unspecified },
            }}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={severityColors[item.name] || PALETTE.fog} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <Empty label="No allergy details logged yet." />
        )}
      </CardContent>
    </Card>
  );
}
