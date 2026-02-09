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
    <Card className="h-full border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0 pb-0">
        <CardTitle className="mb-0 text-base font-semibold">Medications & Allergies</CardTitle>
        <CardDescription className="mt-0 text-xs text-muted-foreground">
          Most taken medications and key allergies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Effective Medications
          </p>
          <div className="grid gap-2">
            {medications.map((med) => (
              <div
                key={med.name}
                className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {med.name} - {med.dose}
                  </p>
                  <p className="mt-0 text-xs text-muted-foreground">Most taken for fever</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  Effective
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key Allergies
          </p>
          <div className="flex max-h-16 flex-wrap gap-1.5 overflow-hidden">
            {allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full border border-blue-200/70 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                <AlertTriangle className="h-3 w-3" />
                {a}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
