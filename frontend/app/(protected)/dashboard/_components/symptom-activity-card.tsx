import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import type { SymptomDataPoint } from "./types"

type SymptomActivityCardProps = {
  data: SymptomDataPoint[]
}

export function SymptomActivityCard({ data }: SymptomActivityCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0 pb-0">
        <CardTitle className="mb-0 text-base font-semibold">Symptom Activity</CardTitle>
        <CardDescription className="mt-0 text-xs text-muted-foreground">
          Frequency over the past 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ChartContainer
          className="h-52 w-full"
          config={{
            frequency: { label: "Frequency", color: "#3b82f6" },
          }}
        >
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="frequency" radius={[4, 4, 4, 4]} fill="#3b82f6" fillOpacity={0.85} barSize={16} />
          </BarChart>
        </ChartContainer>
        <div className="rounded-xl border border-blue-200/70 bg-white px-3.5 py-2.5 text-xs text-slate-700">
          <span className="font-medium text-foreground">Pattern detected:</span>{" "}
          Fatigue spikes on Mondays - correlates with weekend sleep disruption. Severity stable since mid-January.
        </div>
      </CardContent>
    </Card>
  )
}
