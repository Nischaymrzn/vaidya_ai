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
    <Card className="border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="mb-0 text-base font-semibold">Health Records</CardTitle>
            <CardDescription className="mt-0 text-xs text-muted-foreground">
              Recent records and diagnoses
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-full px-3 text-xs" asChild>
            <Link href="/health-records">View Records</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn("rounded-xl border border-slate-200/80 p-4 pb-8", item.bg)}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2.5 text-sm font-medium text-foreground leading-snug">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
