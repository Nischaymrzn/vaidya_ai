import { DashboardClient } from "./_components/dashboard-client";
import { getDashboardSummary } from "@/lib/actions/dashboard-action";

export default async function OverviewPage() {
  const summaryResult = await getDashboardSummary();

  const summary = summaryResult.data;

  return (
    <DashboardClient
      userName={summary?.userName ?? ""}
      vaidyaScore={summary?.vaidyaScore}
      summaryCards={summary?.summaryCards ?? []}
      vitalsData={summary?.vitalsData ?? []}
      vitalStats={summary?.vitalStats ?? []}
      symptomData={summary?.symptomData ?? []}
      symptomPattern={summary?.symptomPattern ?? ""}
      medications={summary?.medications ?? []}
      allergies={summary?.allergies ?? []}
      clinicalItems={summary?.clinicalItems ?? []}
      insights={summary?.insights ?? []}
      timelineItems={summary?.timelineItems ?? []}
      healthScoreTrend={summary?.healthScoreTrend ?? []}
    />
  );
}
