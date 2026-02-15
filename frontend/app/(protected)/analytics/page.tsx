import { getAnalyticsSummary } from "@/lib/actions/analytics-action";
import { AnalyticsClient } from "./_components/analytics-client";

export default async function AnalyticsPage() {
  const result = await getAnalyticsSummary({ months: 12 });
  const fallback = {
    dateRange: {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      months: 12,
    },
    summary: {
      activeConditions: 0,
      activeMedications: 0,
      encounters: 0,
      immunizations: 0,
      notes: {
        recentConditions: 0,
        medicationChanges: 0,
        telehealthVisits: 0,
        boostersDue: 0,
      },
    },
    encounterTotals: {
      outpatient: 0,
      telehealth: 0,
      inpatient: 0,
    },
    encounterHistory: [],
    allergySeverity: [],
    topConditions: [],
    procedureBreakdown: [],
    medicationHistory: [],
    immunizationHistory: [],
    providerNetwork: {
      activeProviders: 0,
      referralsYtd: 0,
      careTouchpoints: 0,
      topProviders: [],
    },
  };

  return <AnalyticsClient data={result.data ?? fallback} />;
}
