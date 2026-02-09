import { cn } from "@/lib/utils"
import type { SummaryCard } from "./types"

type SummaryCardsProps = {
  cards: SummaryCard[]
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className={cn(
            "relative h-auto rounded-2xl border p-4 shadow-sm",
            card.surface,
            card.border
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wider",
                  card.titleClass ?? "text-muted-foreground"
                )}
              >
                {card.title}
              </p>
              <p
                className={cn("text-xl font-semibold tracking-tight", card.valueClass)}
              >
                {card.value}
              </p>
              <div
                className={cn(
                  "flex items-center gap-2 text-xs",
                  card.noteClass ?? "text-slate-600"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", card.dot)} />
                <span>{card.note}</span>
              </div>
            </div>
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl ring-1",
                card.iconBg,
                card.iconRing,
                card.iconColor
              )}
            >
              <card.icon className="h-5 w-5" />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
