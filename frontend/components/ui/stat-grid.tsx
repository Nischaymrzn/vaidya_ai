import { cn } from "@/lib/utils"

export type StatItem = {
  label: string
  value: string
  detail?: string
}

type StatGridProps = {
  items: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({ items, columns = 4, className }: StatGridProps) {
  const columnClass =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 3
        ? "md:grid-cols-2 xl:grid-cols-3"
        : "md:grid-cols-2 xl:grid-cols-4"

  return (
    <div
      className={cn(
        "grid divide-y divide-slate-200/60 rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        "md:divide-y-0 md:divide-x md:divide-slate-200/60",
        columnClass,
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="space-y-1.5 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
          <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
          {item.detail ? (
            <p className="text-xs text-slate-500">{item.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
