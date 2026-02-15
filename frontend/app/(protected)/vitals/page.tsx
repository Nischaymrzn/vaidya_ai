import { getVitalsSummary } from "@/lib/actions/vitals-action";
import { VitalsClient } from "./_components/vitals-client";

export default async function VitalsPage() {
  const summaryResult = await getVitalsSummary();
  return (
    <VitalsClient
      summary={summaryResult.data ?? null}
      error={summaryResult.success ? null : summaryResult.message}
    />
  );
}
