import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimelineItem } from "./types"

type TimelineCardProps = {
  items: TimelineItem[]
}

export function TimelineCard({ items }: TimelineCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm pb-9">
      <CardHeader className="space-y-0 pb-0">
        <CardTitle className="mb-0 text-base font-semibold">Timeline</CardTitle>
        <CardDescription className="mt-0 text-xs text-muted-foreground">
          Historical records
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={item.title + item.date} className="relative flex gap-3 pb-4 last:pb-0">
              {i < items.length - 1 && (
                <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border/60" />
              )}
              <div className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-blue-300 bg-blue-50" />
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{item.date}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0 text-xs text-muted-foreground">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
