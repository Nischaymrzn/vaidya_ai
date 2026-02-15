import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const promptCards = [
  {
    title: "Symptom guidance",
    description: "Describe how you feel and get a clear next step.",
  },
  {
    title: "Medication questions",
    description: "Ask about dosage, interactions, or side effects.",
  },
  {
    title: "Care plan recap",
    description: "Summaries of visits, labs, and follow-up tasks.",
  },
  {
    title: "Wellness support",
    description: "Sleep, nutrition, and activity suggestions.",
  },
]

export default function Page() {
  return (
    <div className="flex h-full w-full flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#1F7AE0]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-white"
            >
              <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41l3.95-3.95H2.05a10 10 0 1 0 18.86-4.3" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            How can I help you today?
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-600">
            I can help with symptoms, medications, care plans, and wellness guidance
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {promptCards.map((card) => (
            <button
              key={card.title}
              className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-left transition-all hover:border-[#1F7AE0] hover:bg-[#1F7AE0]/5"
              type="button"
            >
              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1F7AE0]">
                {card.title}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {card.description}
              </p>
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <div className="flex w-full items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 shadow-sm focus-within:border-[#1F7AE0] focus-within:ring-2 focus-within:ring-[#1F7AE0]/10">
            <Input
              className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
              placeholder="Message Vaidya.ai"
            />
            <Button 
              className="h-9 w-9 rounded-full bg-[#1F7AE0] p-0 hover:bg-[#1F7AE0]/90" 
              size="icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </Button>
          </div>
          <p className="text-center text-xs text-slate-500">
            Vaidya.ai can make mistakes. This is not a replacement for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}

