"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Camera,
  CameraOff,
  Captions,
  CaptionsOff,
  Clock,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

const doctorProfiles: Record<
  string,
  { name: string; specialty: string; focus: string[] }
> = {
  "nischay-maharan": {
    name: "Dr. Nischay Maharan",
    specialty: "General Physician AI",
    focus: ["symptom evaluation", "preventive care", "vital review"],
  },
  "trishan-wagle": {
    name: "Dr. Trishan Wagle",
    specialty: "Cardiology AI Specialist",
    focus: ["heart health", "blood pressure", "cholesterol analysis"],
  },
  "albert-maharan": {
    name: "Dr. Albert Maharan",
    specialty: "Endocrinology AI Specialist",
    focus: ["diabetes care", "glucose tracking", "thyroid health"],
  },
  "rabin-tamang": {
    name: "Dr. Rabin Tamang",
    specialty: "Mental Wellness AI Specialist",
    focus: ["stress management", "mood tracking", "sleep health"],
  },
  "kiran-rana": {
    name: "Dr. Kiran Rana",
    specialty: "Respiratory Health AI Specialist",
    focus: ["lung function", "breathing assessment", "asthma care"],
  },
}

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi there! I'm here to help with your health concern. What brings you in today?",
  },
]

export default function DoctorConsultPage() {
  const patientName = "Nischay Maharjan"
  const patientInitials = patientName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctor") ?? "nischay-maharan"
  const doctor = doctorProfiles[doctorId] ?? doctorProfiles["nischay-maharan"]
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [captionsOn, setCaptionsOn] = useState(true)
  const [shareOn, setShareOn] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isThinking, setIsThinking] = useState(false)
  const [interimText, setInterimText] = useState("")
  const recognitionRef = useRef<any>(null)
  const conversationHistoryRef = useRef<ChatMessage[]>(initialMessages)
  const doctorIdRef = useRef(doctorId)
  const micOnRef = useRef(micOn)
  const isSpeakingRef = useRef(isSpeaking)
  const isThinkingRef = useRef(isThinking)
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)

  const supportsSpeech = useMemo(() => {
    if (typeof window === "undefined") return false
    return (
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    )
  }, [])

  const stopSpeaking = () => {
    if (typeof window === "undefined") return
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const speak = (text: string) => {
    if (typeof window === "undefined") return
    if (!("speechSynthesis" in window)) return
    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isThinkingRef.current) return
    setInterimText("")
    const userMessage: ChatMessage = { role: "user", content }
    const nextHistory = [...conversationHistoryRef.current, userMessage]
    conversationHistoryRef.current = nextHistory
    setMessages(nextHistory)
    setIsThinking(true)
    isThinkingRef.current = true
    stopSpeaking()
    try {
      const response = await fetch("/api/vaidya-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: doctorIdRef.current,
          includeHealthContext: true,
          messages: nextHistory.slice(-20),
        }),
      })
      const data = await response.json()
      const reply = data?.reply?.trim() || "I'm sorry, I couldn't respond."
      setMessages((prev) => {
        const updated = [...prev, { role: "assistant", content: reply }]
        conversationHistoryRef.current = updated
        return updated
      })
      speak(reply)
    } catch (error) {
      setMessages((prev) => {
        const updated = [
          ...prev,
          {
            role: "assistant",
            content: "I ran into an error. Please try again in a moment.",
          },
        ]
        conversationHistoryRef.current = updated
        return updated
      })
    } finally {
      setIsThinking(false)
      isThinkingRef.current = false
    }
  }

  useEffect(() => {
    if (!supportsSpeech) return
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      if (!micOnRef.current || isSpeakingRef.current || isThinkingRef.current) {
        return
      }
      let interim = ""
      let finalText = ""
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      setInterimText(interim.trim())
      if (finalText.trim()) {
        sendMessage(finalText.trim())
      }
    }

    recognition.onerror = () => {
      setMicOn(false)
    }

    recognitionRef.current = recognition
    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [supportsSpeech])

  useEffect(() => {
    micOnRef.current = micOn
  }, [micOn])

  useEffect(() => {
    doctorIdRef.current = doctorId
  }, [doctorId])

  useEffect(() => {
    conversationHistoryRef.current = messages
  }, [messages])

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    isThinkingRef.current = isThinking
  }, [isThinking])

  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    if (micOn && !isSpeaking) {
      try {
        recognition.start()
      } catch {
        // Ignore "already started" errors
      }
    } else {
      recognition.stop()
      setInterimText("")
    }
  }, [micOn, isSpeaking])

  useEffect(() => {
    if (!transcriptScrollRef.current) return
    transcriptScrollRef.current.scrollTo({
      top: transcriptScrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, interimText, isThinking])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Doctor: {doctor.name}
              </h1>
              <p className="text-xs text-slate-500">{doctor.specialty}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              00:05:40
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-stretch">
            <div className="min-w-0 space-y-3">

              <div className="grid gap-4 lg:grid-rows-[auto_auto]">
                <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm py-0">
                  <CardContent className="relative p-0 h-full">
                    <div className="relative aspect-[16/6.5] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-700 to-slate-600">
                      <Image
                        src="/doctor.png"
                        alt="Doctor"
                        fill
                        sizes="(min-width: 1280px) 900px, 100vw"
                        className="object-contain"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                        {doctor.name}
                      </div>
                      <div className="absolute bottom-4 left-4 max-w-[80%] rounded-2xl bg-black/60 px-4 py-2 text-sm text-white">
                        We can review {doctor.focus[0]} and {doctor.focus[1]} together.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm py-0 overflow-y-hidden">
                  <CardContent className="relative p-0">
                    <div
                      className={`relative aspect-[16/6.5] w-full ${cameraOn
                        ? "bg-gradient-to-br from-slate-200 via-slate-100 to-white"
                        : "bg-slate-900"
                        }`}
                    >
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                        {patientName}
                      </div>
                      {shareOn ? (
                        <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Sharing screen
                        </div>
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {cameraOn ? (
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-semibold text-slate-700 shadow-sm">
                            {patientInitials}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                            <CameraOff className="h-4 w-4" />
                            Camera off
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className={
                            micOn
                              ? "h-9 w-9 rounded-full border-primary/30 bg-primary/10 text-primary"
                              : "h-9 w-9 rounded-full border-slate-200"
                          }
                          aria-pressed={micOn}
                          onClick={() => setMicOn((prev) => !prev)}
                        >
                          {micOn ? (
                            <Mic className="h-4 w-4 text-primary" />
                          ) : (
                            <MicOff className="h-4 w-4 text-slate-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className={
                            cameraOn
                              ? "h-9 w-9 rounded-full border-primary/30 bg-primary/10 text-primary"
                              : "h-9 w-9 rounded-full border-slate-200"
                          }
                          aria-pressed={cameraOn}
                          onClick={() => setCameraOn((prev) => !prev)}
                        >
                          {cameraOn ? (
                            <Camera className="h-4 w-4 text-primary" />
                          ) : (
                            <CameraOff className="h-4 w-4 text-slate-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className={
                            captionsOn
                              ? "h-9 w-9 rounded-full border-primary/30 bg-primary/10 text-primary"
                              : "h-9 w-9 rounded-full border-slate-200"
                          }
                          aria-pressed={captionsOn}
                          onClick={() => setCaptionsOn((prev) => !prev)}
                        >
                          {captionsOn ? (
                            <Captions className="h-4 w-4 text-primary" />
                          ) : (
                            <CaptionsOff className="h-4 w-4 text-slate-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className={
                            shareOn
                              ? "h-9 w-9 rounded-full border-primary/30 bg-primary/10 text-primary"
                              : "h-9 w-9 rounded-full border-slate-200"
                          }
                          aria-pressed={shareOn}
                          onClick={() => setShareOn((prev) => !prev)}
                        >
                          {shareOn ? (
                            <ScreenShare className="h-4 w-4 text-primary" />
                          ) : (
                            <ScreenShareOff className="h-4 w-4 text-slate-600" />
                          )}
                        </Button>
                        <Button size="icon" className="h-9 w-9 rounded-full bg-rose-600 text-white hover:bg-rose-700">
                          <PhoneOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <aside className="min-w-0 space-y-3">
              <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm xl:h-[calc(100vh-220px)]">
                <CardContent className="flex h-full min-h-0 flex-col p-0">
                  <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">Live transcript</p>
                      <p className="text-xs text-slate-500">
                        Real-time voice summary &amp; notes
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${captionsOn
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {captionsOn ? "Active" : "Off"}
                    </span>
                  </div>

                  <div
                    ref={transcriptScrollRef}
                    className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-3"
                  >
                    {captionsOn ? (
                      <>
                        {messages.map((message, index) => {
                          const isUser = message.role === "user"
                          return (
                            <div
                              key={`${message.role}-${index}`}
                              className={`flex items-start ${isUser ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isUser
                                  ? "bg-primary/10 text-slate-900"
                                  : "bg-white text-slate-700"
                                  }`}
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                  {isUser ? "You" : doctor.name}
                                </p>
                                <p>{message.content}</p>
                              </div>
                            </div>
                          )
                        })}
                        {interimText ? (
                          <div className="flex items-start justify-end gap-2">
                            <div className="max-w-[85%] rounded-2xl bg-primary/10 px-4 py-2.5 text-sm text-slate-600">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                You
                              </p>
                              <p>{interimText}</p>
                            </div>
                          </div>
                        ) : null}
                        {isThinking ? (
                          <div className="flex items-start gap-2">
                            <div className="max-w-[85%] rounded-2xl bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                {doctor.name}
                              </p>
                              <p>Thinking...</p>
                            </div>
                          </div>
                        ) : null}
                        <div ref={transcriptEndRef} />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-xs text-slate-500">
                        Captions are off.
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 px-4 py-3">
                    <Button
                      variant="outline"
                      className="h-9 rounded-full border-slate-200 px-4 text-xs font-semibold text-slate-700"
                      onClick={stopSpeaking}
                      disabled={!isSpeaking}
                    >
                      Stop speaking
                    </Button>
                    <span className="text-xs text-slate-500">
                      {isSpeaking
                        ? "AI is speaking. Mic is paused."
                        : micOn
                          ? "Mic is on."
                          : "Mic is off."}
                    </span>
                  </div>
                  {!supportsSpeech ? (
                    <div className="mx-4 mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Your browser does not support voice recognition. Use a Chromium-based browser.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
