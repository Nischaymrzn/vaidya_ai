import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimelineItem } from "./types"

type TimelineCardProps = {
  items: TimelineItem[]
}

export function TimelineCard({ items }: TimelineCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm pb-6">
      <CardHeader className="space-y-0.5 pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">Timeline</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Historical records
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {items.length ? (
          <div className="space-y-0">
            {items.map((item, i) => (
              <div
                key={`${item.title}-${item.date}-${item.meta}-${i}`}
                className="relative flex gap-3 pb-4 last:pb-0"
              >
                {i < items.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200" />
                )}
                <div className="relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 border-[#1F7AE0] bg-white" />
                <div className="min-w-0 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.date}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-sm text-slate-500">
            No timeline activity yet. Add records to see history.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
