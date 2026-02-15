import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ClinicalItem } from "./types"

type HealthRecordsCardProps = {
  items: ClinicalItem[]
}

export function HealthRecordsCard({ items }: HealthRecordsCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">Health Records</CardTitle>
            <CardDescription className="mt-0.5 text-sm text-slate-500">
              Recent records and diagnoses
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-slate-200 px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900" asChild>
            <Link href="/health-records">View Records</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-5 pt-2">
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn("rounded-2xl border border-slate-200/80 bg-white p-4 pb-8", item.bg)}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <p className="mt-2.5 text-sm font-medium leading-snug text-slate-900">
                {item.value}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">{item.meta}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
