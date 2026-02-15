"use client";

import type { AnalyticsSummary } from "@/lib/definition";
import { useAnalytics } from "../_hooks/use-analytics";
import Allergies from "./allergies";
import Conditions from "./conditions";
import Encounters from "./encounters";
import Header from "./header";
import Immunizations from "./immunizations";
import Medications from "./medications";
import Network from "./network";
import Procedures from "./procedures";
import Summary from "./summary";

export function AnalyticsClient({ data }: { data: AnalyticsSummary }) {
  const {
    summaryCards,
    encounterHasData,
    allergyHasData,
    conditionsHasData,
    procedureHasData,
    medicationHasData,
    immunizationHasData,
    providerNodes,
  } = useAnalytics(data);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Header />
          <Summary items={summaryCards} />

          <div className="grid gap-5 lg:grid-cols-12">
            <Encounters
              history={data.encounterHistory}
              totals={data.encounterTotals}
              hasData={encounterHasData}
            />
            <Allergies data={data.allergySeverity} hasData={allergyHasData} />
            <Conditions data={data.topConditions} hasData={conditionsHasData} />
            <Procedures data={data.procedureBreakdown} hasData={procedureHasData} />
            <Medications data={data.medicationHistory} hasData={medicationHasData} />
            <Immunizations data={data.immunizationHistory} hasData={immunizationHasData} />
            <Network stats={data.providerNetwork} graph={providerNodes} />
          </div>
        </div>
      </div>
    </div>
  );
}
