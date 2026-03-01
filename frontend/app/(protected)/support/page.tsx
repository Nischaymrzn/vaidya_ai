import Link from "next/link"
import {
  ChevronDown,
  Mail,
  Search,
  Settings,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const quickActions = [
  {
    title: "Ask Vaidya.ai",
    description: "Get instant answers for symptoms, meds, and care plans.",
    href: "/ai-assistant",
    icon: Sparkles,
  },
  {
    title: "Contact support",
    description: "Reach a specialist for billing or account help.",
    href: "/profile/support/contact",
    icon: Mail,
  },
  {
    title: "Account settings",
    description: "Manage personal details, security, and notifications.",
    href: "/profile/account/personal",
    icon: Settings,
  },
]

const popularGuides = [
  {
    title: "Understand your risk analysis",
    description: "Learn how scores, signals, and recommendations are generated.",
    href: "/health-intelligence/risk-analysis",
    tag: "Popular",
  },
  {
    title: "Upload health records",
    description: "Add lab reports, prescriptions, and imaging in minutes.",
    href: "/health-records",
    tag: "Records",
  },
  {
    title: "Manage family profiles",
    description: "Track loved ones with shared vitals and alerts.",
    href: "/family-health",
    tag: "Family",
  },
  {
    title: "Configure notifications",
    description: "Choose what updates you want to receive.",
    href: "/profile/general/notification",
    tag: "Settings",
  },
]

const faqs = [
  {
    question: "How often does risk analysis update?",
    answer:
      "Risk analysis refreshes whenever you run it. New vitals, records, or symptoms improve the signal quality and update the score.",
  },
  {
    question: "Can I export my health data?",
    answer:
      "Yes. You can download reports from Health Records and export summaries directly from the Risk Analysis report view.",
  },
  {
    question: "Where can I update my medications?",
    answer:
      "Go to Health Records to add or edit medications. Changes appear across your dashboard and risk analysis automatically.",
  },
  {
    question: "Who can see my records?",
    answer:
      "Only you and the family members you add to your care group can view shared records. You can revoke access anytime.",
  },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                  Help Center
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  How can we help?
                </h1>
                <p className="max-w-2xl text-sm text-slate-500">
                  Find answers, manage your account, or reach support. We keep things
                  concise so you can get back to your care.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="h-10 rounded-full">
                  <Link href="/profile/support/contact">Contact support</Link>
                </Button>
                <Button asChild variant="ghost" className="h-10 rounded-full">
                  <Link href="/ai-assistant">Ask Vaidya.ai</Link>
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search help articles, topics, and settings"
                  className="h-11 rounded-full border-slate-200/80 bg-slate-50 pl-10 text-sm"
                />
              </div>

            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <Card
                  key={action.title}
                  className="rounded-3xl border-slate-200/80 bg-white shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full rounded-full">
                      <Link href={action.href}>Open</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </section>



          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">FAQ</h2>
              <p className="text-sm text-slate-500">Quick answers to common questions.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white">
              {faqs.map((item, index) => (
                <details
                  key={item.question}
                  open={index === 0}
                  className="group border-b border-slate-200 last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-0.5 text-sm text-slate-600">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

