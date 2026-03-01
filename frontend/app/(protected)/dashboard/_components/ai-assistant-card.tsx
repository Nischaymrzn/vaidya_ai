import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function AiAssistantCard() {
  return (
    <Card className="rounded-2xl border-[#1F7AE0]/30 bg-[#1F7AE0] shadow-sm">
      <CardContent className="flex flex-col gap-3 py-5">
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/80">
            Vaidya.ai
          </p>
          <p className="text-base font-semibold leading-relaxed text-white">
            Your personal AI doctor for symptoms, medications, and care plans
          </p>
        </div>
        <Button
          className="w-full rounded-full bg-[oklch(0.985_0_0)] py-5 text-sm font-semibold text-[#1F7AE0] hover:bg-[oklch(0.95_0_0)]"
          asChild
        >
          <Link href="/ai-assistant">Open Vaidya.ai</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
