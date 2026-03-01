"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

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

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi there! I'm Vaidya.ai. Tell me what you'd like help with today.",
  },
]

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const conversationRef = useRef<ChatMessage[]>(initialMessages)
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isThinking) return
    const nextHistory = [...conversationRef.current, { role: "user", content: trimmed }]
    conversationRef.current = nextHistory
    setMessages(nextHistory)
    setInputValue("")
    setIsThinking(true)
    try {
      const response = await fetch("/api/vaidya-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: "nischay-maharan",
          includeHealthContext: true,
          messages: nextHistory.slice(-20),
        }),
      })
      const data = await response.json()
      const reply =
        data?.reply?.trim() ||
        data?.message?.trim() ||
        "I'm sorry, I couldn't respond."
      const updated = [...conversationRef.current, { role: "assistant", content: reply }]
      conversationRef.current = updated
      setMessages(updated)
    } catch {
      const updated = [
        ...conversationRef.current,
        {
          role: "assistant",
          content: "I ran into an error. Please try again in a moment.",
        },
      ]
      conversationRef.current = updated
      setMessages(updated)
    } finally {
      setIsThinking(false)
    }
  }

  useEffect(() => {
    if (!transcriptScrollRef.current) return
    transcriptScrollRef.current.scrollTo({
      top: transcriptScrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, isThinking])

  const hasChatStarted = messages.length > 1

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col">
      <div className="mx-auto flex h-full w-full max-w-5xl min-h-0 flex-col px-4 py-6">
        {!hasChatStarted ? (
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
        ) : null}

        {!hasChatStarted ? (
          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {promptCards.map((card) => (
              <button
                key={card.title}
                className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-left transition-all hover:border-[#1F7AE0] hover:bg-[#1F7AE0]/5"
                type="button"
                onClick={() => sendMessage(card.description)}
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
        ) : (
          <div
            ref={transcriptScrollRef}
            className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-transparent p-4"
          >
            {messages.map((message, index) => {
              const isUser = message.role === "user"
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-start ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isUser
                      ? "bg-[#1F7AE0]/10 text-slate-900"
                      : "bg-white text-slate-700"
                      }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {isUser ? "You" : "Vaidya.ai"}
                    </p>
                    <p>{message.content}</p>
                  </div>
                </div>
              )
            })}
            {isThinking ? (
              <div className="flex items-start">
                <div className="max-w-[85%] rounded-2xl bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Vaidya.ai
                  </p>
                  <p>Thinking...</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex w-full items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 shadow-sm focus-within:border-[#1F7AE0] focus-within:ring-2 focus-within:ring-[#1F7AE0]/10">
            <Input
              className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
              placeholder="Message Vaidya.ai"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  sendMessage(inputValue)
                }
              }}
            />
            <Button
              className="h-9 w-9 rounded-full bg-[#1F7AE0] p-0 hover:bg-[#1F7AE0]/90"
              size="icon"
              onClick={() => sendMessage(inputValue)}
              disabled={isThinking || !inputValue.trim()}
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
