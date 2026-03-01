import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle } from "lucide-react"
import type { MedicationItem } from "./types"

type MedicationsAllergiesCardProps = {
  medications: MedicationItem[]
  allergies: string[]
}

export function MedicationsAllergiesCard({
  medications,
  allergies,
}: MedicationsAllergiesCardProps) {
  return (
    <Card className="h-full rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">Medications & Allergies</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Most taken medications and key allergies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Effective Medications
          </p>
          <div className="grid gap-2.5">
            {medications.map((med) => (
              <div
                key={med.name}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {med.name} - {med.dose}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {med.meta ?? "Medication on file"}
                  </p>
                </div>
                <span className="rounded-full bg-[#1F7AE0]/10 px-3 py-1 text-[11px] font-semibold text-[#1F7AE0]">
                  Effective
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Key Allergies
          </p>
          <div className="flex max-h-20 flex-wrap gap-2 overflow-hidden">
            {allergies.map((a, index) => (
              <span
                key={`${a}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
