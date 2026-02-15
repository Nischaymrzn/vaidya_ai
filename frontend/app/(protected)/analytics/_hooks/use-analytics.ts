import { useMemo } from "react";
import type { StatItem } from "@/components/ui/stat-grid";
import type { AnalyticsSummary } from "@/lib/definition";
import { buildProviderNodes, formatNumber } from "../_lib/utils";

export function useAnalytics(data: AnalyticsSummary) {
  const summaryCards = useMemo<StatItem[]>(
    () => [
      {
        label: "Active Conditions",
        value: formatNumber(data.summary.activeConditions),
        detail: data.summary.notes.recentConditions
          ? `${data.summary.notes.recentConditions} added in last 90 days`
          : "No new conditions in last 90 days",
      },
      {
        label: "Active Medications",
        value: formatNumber(data.summary.activeMedications),
        detail: data.summary.notes.medicationChanges
          ? `${data.summary.notes.medicationChanges} changes in last 90 days`
          : "No recent medication changes",
      },
      {
        label: "Encounters",
        value: formatNumber(data.summary.encounters),
        detail: data.summary.notes.telehealthVisits
          ? `${data.summary.notes.telehealthVisits} telehealth visits`
          : "No telehealth visits logged",
      },
      {
        label: "Immunizations",
        value: formatNumber(data.summary.immunizations),
        detail: data.summary.notes.boostersDue
          ? `${data.summary.notes.boostersDue} boosters due soon`
          : "No boosters due soon",
      },
    ],
    [data],
  );

  const encounterHasData = useMemo(
    () => data.encounterHistory.some((item) => item.outpatient + item.telehealth + item.inpatient > 0),
    [data.encounterHistory],
  );

  const allergyHasData = useMemo(
    () => data.allergySeverity.some((item) => item.value > 0),
    [data.allergySeverity],
  );

  const conditionsHasData = useMemo(() => data.topConditions.length > 0, [data.topConditions]);

  const procedureHasData = useMemo(
    () => data.procedureBreakdown.some((item) => item.count > 0),
    [data.procedureBreakdown],
  );

  const medicationHasData = useMemo(
    () => data.medicationHistory.some((item) => item.active + item.new + item.stopped > 0),
    [data.medicationHistory],
  );

  const immunizationHasData = useMemo(
    () => data.immunizationHistory.some((item) => item.routine + item.booster + item.travel > 0),
    [data.immunizationHistory],
  );

  const providerNodes = useMemo(
    () =>
      data.providerNetwork.topProviders.length
        ? buildProviderNodes(data.providerNetwork.topProviders)
        : null,
    [data.providerNetwork.topProviders],
  );

  return {
    summaryCards,
    encounterHasData,
    allergyHasData,
    conditionsHasData,
    procedureHasData,
    medicationHasData,
    immunizationHasData,
    providerNodes,
  };
}
