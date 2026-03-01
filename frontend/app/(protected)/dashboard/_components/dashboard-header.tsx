import { Badge } from "@/components/ui/badge"

type DashboardHeaderProps = {
  greeting: string
  firstName: string
}

export function DashboardHeader({ greeting, firstName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s your health overview for today
        </p>
      </div>

    </div>
  )
}
