import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RiskFactor } from "./types"

type RiskAssessmentCardProps = {
  risks: RiskFactor[]
}

export function RiskAssessmentCard({ risks }: RiskAssessmentCardProps) {
  const PRIMARY = "#1F7AE0";

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base font-semibold text-slate-900">Risk Assessment</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Risk factors based on records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {risks.length ? (
          <div className="space-y-4">
            {risks.slice(0, 2).map((risk) => (
              <div key={risk.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{risk.label}</span>
                  <span className="rounded-full bg-[#1F7AE0]/10 px-3 py-1 text-xs font-semibold text-[#1F7AE0]">
                    {risk.level} - {risk.score}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${risk.score}%`,
                      backgroundColor: PRIMARY 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-sm text-slate-500">
            No risk factors yet. Add vitals and symptoms to generate a score.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
