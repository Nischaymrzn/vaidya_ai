import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function AiAssistantCard() {
  return (
    <Card className="border-blue-700/80 bg-linear-to-br from-blue-800 via-blue-700 to-blue-600 text-white shadow-sm">
      <CardContent className="flex flex-col gap-3 py-3.5">
        <div className="flex items-start gap-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Vaidya AI Assistant</p>
            <p className="text-xs text-blue-100">
              Ask about symptoms, medications, or your records
            </p>
          </div>
        </div>
        <Button className="mt-1 w-full rounded-xl bg-white text-blue-900 hover:bg-blue-50" asChild>
          <Link href="/ai-assistant">Chat with Vaidya.ai</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
