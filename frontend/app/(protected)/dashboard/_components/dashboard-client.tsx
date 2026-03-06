"use client"

import { CHART_COLORS } from "../../../../constants/dashboard-data"
import { AiAssistantCard } from "./ai-assistant-card"
import { DashboardHeader } from "./dashboard-header"
import { HealthRecordsCard } from "./health-records-card"
import { InsightsCard } from "./insights-card"
import { MedicationsAllergiesCard } from "./medications-allergies-card"
import { SummaryCards } from "./summary-cards"
import { SymptomActivityCard } from "./symptom-activity-card"
import { TimelineCard } from "./timeline-card"
import { VaidyaScoreCard } from "./vaidya-score-card"
import { VitalTrendsCard } from "./vital-trends-card"
import { getGreeting } from "./greet"
import type {
  ClinicalItem,
  HealthScorePoint,
  InsightItem,
  MedicationItem,
  SummaryCard,
  SymptomDataPoint,
  TimelineItem,
  VitalDataPoint,
} from "./types"

type DashboardClientProps = {
  userName: string
  vaidyaScore?: number | null
  summaryCards: SummaryCard[]
  vitalsData: VitalDataPoint[]
  vitalStats: { label: string; value: string; note: string }[]
  symptomData: SymptomDataPoint[]
  symptomPattern?: string
  medications: MedicationItem[]
  allergies: string[]
  clinicalItems: ClinicalItem[]
  insights: InsightItem[]
  timelineItems: TimelineItem[]
  healthScoreTrend: HealthScorePoint[]
}

export function DashboardClient({
  userName,
  vaidyaScore,
  summaryCards,
  vitalsData,
  vitalStats,
  symptomData,
  symptomPattern,
  medications,
  allergies,
  clinicalItems,
  insights,
  timelineItems,
  healthScoreTrend,
}: DashboardClientProps) {
  const greeting = getGreeting()
  const firstName = userName.split(" ")[0] || "there"

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <DashboardHeader greeting={greeting} firstName={firstName} />

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
            <div className="flex flex-col gap-5">
              <SummaryCards cards={summaryCards} />
              <VitalTrendsCard data={vitalsData} colors={CHART_COLORS} stats={vitalStats} />
              <div className="grid gap-5 lg:grid-cols-2">
                <SymptomActivityCard data={symptomData} pattern={symptomPattern} />
                <MedicationsAllergiesCard medications={medications} allergies={allergies} />
              </div>
              <HealthRecordsCard items={clinicalItems} />
            </div>

            <div className="flex flex-col gap-5">
              <VaidyaScoreCard
                score={typeof vaidyaScore === "number" ? vaidyaScore : undefined}
                trend={healthScoreTrend}
              />
              <InsightsCard insights={insights} symptoms={symptomData} vitals={vitalStats} />
              <TimelineCard items={timelineItems} />
              <AiAssistantCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
