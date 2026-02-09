import { Badge } from "@/components/ui/badge"

type DashboardHeaderProps = {
  greeting: string
  firstName: string
}

export function DashboardHeader({ greeting, firstName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {firstName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s your health overview for today
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm">
          Last synced - Feb 9, 2026 â€” 9:20 AM
        </span>
        <Badge
          variant="outline"
          className="border-blue-200/70 bg-blue-50 text-blue-700"
        >
          Status: Stable
        </Badge>
      </div>
    </div>
  )
}
