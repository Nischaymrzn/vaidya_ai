import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RiskFactor } from "./types"

type RiskAssessmentCardProps = {
  risks: RiskFactor[]
}

export function RiskAssessmentCard({ risks }: RiskAssessmentCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0 pb-0">
        <CardTitle className="mb-0 text-base font-semibold">Risk Assessment</CardTitle>
        <CardDescription className="mt-0 text-xs text-muted-foreground">
          Risk factors based on records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {risks.map((risk) => (
          <div key={risk.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{risk.label}</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {risk.level} - {risk.score}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-blue-50">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${risk.score}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
