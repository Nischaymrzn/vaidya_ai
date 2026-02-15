import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { SymptomDataPoint } from "./types"

type SymptomActivityCardProps = {
  data: SymptomDataPoint[]
  pattern?: string
}

export function SymptomActivityCard({ data, pattern }: SymptomActivityCardProps) {
  const PRIMARY = "#1F7AE0";
  
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">Symptom Activity</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Frequency over the past 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <ChartContainer
          className="h-48 w-full"
          config={{
            frequency: { label: "Frequency", color: PRIMARY },
          }}
        >
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              width={90} 
              tick={{ fontSize: 13, fill: "#64748b" }} 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="frequency" 
              radius={[6, 6, 6, 6]} 
              fill={PRIMARY} 
              fillOpacity={0.9} 
              barSize={14} 
            />
          </BarChart>
        </ChartContainer>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-600">
          <span className="font-medium text-slate-900">Pattern detected:</span>{" "}
          {pattern ?? "No symptom pattern detected yet."}
        </div>
      </CardContent>
    </Card>
  )
}
