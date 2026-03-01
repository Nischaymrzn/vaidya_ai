import Link from "next/link"
import {
  BookOpen,
  Clock,
  LifeBuoy,
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
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-slate-200/70 px-3 py-1">
                  Top: Risk analysis
                </span>
                <span className="rounded-full border border-slate-200/70 px-3 py-1">
                  Health records
                </span>
                <span className="rounded-full border border-slate-200/70 px-3 py-1">
                  Notifications
                </span>
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

          <section className="grid gap-5 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Popular guides</h2>
                <p className="text-sm text-slate-500">
                  Short walkthroughs that cover the essentials.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {popularGuides.map((guide) => (
                  <Card
                    key={guide.title}
                    className="rounded-3xl border-slate-200/80 bg-white shadow-sm"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-semibold text-slate-900">
                          {guide.title}
                        </CardTitle>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                          {guide.tag}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-slate-500">
                        {guide.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="ghost" className="h-8 px-0 text-xs">
                        <Link href={guide.href}>Read guide</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <LifeBuoy className="h-4 w-4" />
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Support hours
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  We respond quickly during business hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Mon - Fri, 9:00 AM to 6:00 PM
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  Typical response time: 2-4 hours
                </div>
                <Button asChild variant="outline" className="w-full rounded-full">
                  <Link href="/profile/support/contact">Send a message</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">FAQ</h2>
              <p className="text-sm text-slate-500">Quick answers to common questions.</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {faqs.map((item) => (
                <Card
                  key={item.question}
                  className="rounded-3xl border-slate-200/80 bg-white shadow-sm"
                >
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-slate-500">
                    {item.answer}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

