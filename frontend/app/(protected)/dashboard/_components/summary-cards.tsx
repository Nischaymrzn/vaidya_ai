import { StatGrid, type StatItem } from "@/components/ui/stat-grid"
import type { SummaryCard } from "./types"

type SummaryCardsProps = {
  cards?: SummaryCard[]
}

export function SummaryCards({ cards = [] }: SummaryCardsProps) {
  const items: StatItem[] = cards.map((card) => ({
    label: card.title,
    value: card.value,
    detail: card.note,
  }))

  return <StatGrid items={items} columns={3} />
}
