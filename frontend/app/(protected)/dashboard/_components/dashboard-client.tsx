"use client"

import {
  CHART_COLORS,
  HEALTH_SCORE,
  aiInsights,
  allergies,
  clinicalItems,
  healthScoreTrend,
  medications,
  riskFactors,
  summaryCards,
  symptomData,
  timelineItems,
  vitalsData,
} from "../../../../constants/dashboard-data"
import { AiAssistantCard } from "./ai-assistant-card"
import { DashboardHeader } from "./dashboard-header"
import { HealthRecordsCard } from "./health-records-card"
import { InsightsCard } from "./insights-card"
import { MedicationsAllergiesCard } from "./medications-allergies-card"
import { RiskAssessmentCard } from "./risk-assessment-card"
import { SummaryCards } from "./summary-cards"
import { SymptomActivityCard } from "./symptom-activity-card"
import { TimelineCard } from "./timeline-card"
import { VaidyaScoreCard } from "./vaidya-score-card"
import { VitalTrendsCard } from "./vital-trends-card"
import { getGreeting } from "./greet"

export function DashboardClient({ userName }: { userName: string }) {
  const greeting = getGreeting()
  const firstName = userName.split(" ")[0] || "there"

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <DashboardHeader greeting={greeting} firstName={firstName} />

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
            <div className="flex flex-col gap-5">
              <SummaryCards cards={summaryCards} />
              <VitalTrendsCard data={vitalsData} colors={CHART_COLORS} />
              <div className="grid gap-6 lg:grid-cols-2">
                <SymptomActivityCard data={symptomData} />
                <MedicationsAllergiesCard medications={medications} allergies={allergies} />
              </div>
              <HealthRecordsCard items={clinicalItems} />
            </div>

            <div className="flex flex-col gap-5">
              <VaidyaScoreCard score={HEALTH_SCORE} trend={healthScoreTrend} />
              <RiskAssessmentCard risks={riskFactors} />
              <InsightsCard insights={aiInsights} />
              <TimelineCard items={timelineItems} />
              <AiAssistantCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
