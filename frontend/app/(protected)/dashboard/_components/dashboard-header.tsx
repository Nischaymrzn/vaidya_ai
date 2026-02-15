import { Badge } from "@/components/ui/badge"

type DashboardHeaderProps = {
  greeting: string
  firstName: string
}

export function DashboardHeader({ greeting, firstName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-slate-500">
          Here&apos;s your health overview for today
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
          Last synced - Feb 9, 2026 - 9:20 AM
        </span>
        <Badge
          variant="outline"
          className="border-slate-200 bg-white text-slate-500"
        >
          Status: Stable
        </Badge>
      </div>
    </div>
  )
}
