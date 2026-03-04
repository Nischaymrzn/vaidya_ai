"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Brain, Droplets, HeartPulse, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { generateRiskAssessment, getRiskAssessments } from "@/lib/actions/risk-assessment-action"
import type { TRiskAssessment, THealthInsight } from "@/lib/definition"
import { RiskAnalysisReportButton } from "./_components/risk-analysis-report-button"

const PRIMARY = "#1F7AE0"

const diseaseProfiles = [
  {
    key: "diabetes",
    name: "Diabetes",
    icon: Droplets,
    status: "Vitals + history",
    description: "Glucose and BMI history combined with vitals trends.",
    factors: ["Glucose trends", "BMI changes", "Vitals continuity"],
    href: "/health-intelligence/predictions/diabetes",
  },
  {
    key: "heart",
    name: "Heart Disease",
    icon: HeartPulse,
    status: "Vitals + records",
    description: "Blood pressure, glucose, and history signals monitored over time.",
    factors: ["BP variability", "Glucose trends", "Vitals log"],
    href: "/health-intelligence/predictions/heart-disease",
  },
  {
    key: "tuberculosis",
    name: "Tuberculosis",
    icon: ShieldAlert,
    status: "Symptoms + imaging",
    description: "Symptom cadence paired with scan review inputs.",
    factors: ["Symptom cadence", "Exposure flags", "Scan upload"],
    href: "/health-intelligence/predictions/tuberculosis",
  },
  {
    key: "brain",
    name: "Brain Tumor",
    icon: Brain,
    status: "Symptoms + imaging",
    description: "Neurological signals assessed with MRI uploads.",
    factors: ["Neuro symptoms", "Scan upload", "Clinical notes"],
    href: "/health-intelligence/predictions/brain-tumor",
  },
]

const fallbackRiskTrend = [
  { month: "Apr", risk: 48 },
  { month: "May", risk: 44 },
  { month: "Jun", risk: 46 },
  { month: "Jul", risk: 39 },
  { month: "Aug", risk: 36 },
  { month: "Sep", risk: 32 },
]

const fallbackFactorImpact = [
  { name: "Vitals", impact: 32 },
  { name: "Symptoms", impact: 22 },
  { name: "Records", impact: 26 },
  { name: "Imaging", impact: 20 },
]

const fallbackInsightSignals = [
  { label: "Glucose trend", value: "Stable over last 6 logs" },
  { label: "BP variability", value: "Medium variance detected" },
  { label: "Symptom clusters", value: "Respiratory signals low" },
  { label: "Recent records", value: "2 lab reports indexed" },
]

const fallbackChecklistItems = [
  { label: "Add missing vitals entries", detail: "2 logs pending" },
  { label: "Upload latest lab report", detail: "Lipid panel requested" },
  { label: "Review symptom history", detail: "Last update 3 days ago" },
]

const riskBadgeStyles: Record<"Low" | "Medium" | "High", string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  Medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  High: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
}

const insightTone: Record<"High" | "Medium" | "Low" | "Info", string> = {
  High: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  Medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  Info: "border-border bg-muted/40 text-muted-foreground",
}

export default function RiskAnalysisPage() {
  const [analysis, setAnalysis] = useState<TRiskAssessment | null>(null)
  const [analysisInsights, setAnalysisInsights] = useState<THealthInsight[]>([])
  const [riskHistory, setRiskHistory] = useState<TRiskAssessment[]>([])
  const [analysisPending, startAnalysisTransition] = useTransition()

  const analysisReady = Boolean(analysis?.analysis)
  const overallRisk = analysis?.riskScore ?? null
  const confidence = analysis?.confidenceScore
    ? Math.round(analysis.confidenceScore * 100)
    : null
  const resolvedRiskLevel: "Low" | "Medium" | "High" = analysis?.riskLevel
    ?? (overallRisk === null
      ? "Medium"
      : overallRisk >= 70
        ? "High"
        : overallRisk >= 40
          ? "Medium"
          : "Low")
  const resolvedRiskLabel = `${resolvedRiskLevel} risk`
  const signalsCount = useMemo(() => {
    const sections = analysis?.analysis?.sections
    if (!sections) return null
    return Object.values(sections).filter(Boolean).length
  }, [analysis])

  const formatDate = (value?: string) => {
    if (!value) return "--"
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("en-US")
  }

  useEffect(() => {
    let active = true
    const loadHistory = async () => {
      const result = await getRiskAssessments()
      if (!active) return
      if (result.success && result.data) {
        setRiskHistory(result.data)
        const latestWithAnalysis = result.data.find((item) => item.analysis)
        if (latestWithAnalysis) {
          setAnalysis(latestWithAnalysis)
        }
      }
    }
    loadHistory()
    return () => {
      active = false
    }
  }, [])

  const handleRunAnalysis = () => {
    startAnalysisTransition(async () => {
      const result = await generateRiskAssessment({
        includeAi: true,
        includeAnalysis: true,
        useLatest: true,
        maxInsights: 6,
      })
      const data = result.data
      if (!result.success || !data?.assessment) return
      const { assessment } = data
      setAnalysis(assessment)
      setAnalysisInsights(data.insights ?? [])
      setRiskHistory((prev) => [assessment, ...prev])
    })
  }

  const summaryTiles = [
    {
      label: "Overall risk score",
      value: analysisReady && overallRisk !== null ? `${overallRisk}%` : "--",
      detail: "Weighted multi-disease index",
    },
    {
      label: "Model confidence",
      value: analysisReady && confidence !== null ? `${confidence}%` : "--",
      detail: "Based on data density",
    },
    {
      label: "Signals analyzed",
      value: analysisReady && signalsCount !== null ? String(signalsCount) : "--",
      detail: "Vitals, symptoms, records",
    },
    {
      label: "Active models",
      value: "4",
      detail: "Diabetes, heart, TB, brain",
    },
  ]

  const keySignals = analysis?.analysis?.keyFindings?.length
    ? analysis.analysis.keyFindings.slice(0, 4).map((finding) => ({
      label: finding.title,
      value: finding.detail,
    }))
    : analysisInsights.length
      ? analysisInsights.slice(0, 4).map((insight) => ({
        label: insight.insightTitle,
        value: insight.description,
      }))
      : fallbackInsightSignals

  const alertInsights = useMemo(
    () =>
      analysisInsights.filter(
        (insight) => insight.priority === "High" || insight.priority === "Medium",
      ),
    [analysisInsights],
  )

  const improvementInsights = useMemo(
    () =>
      analysisInsights.filter(
        (insight) =>
          insight.priority === "Low" ||
          insight.priority === "Info" ||
          !insight.priority,
      ),
    [analysisInsights],
  )

  const checklistItems = analysis?.analysis?.dataGaps?.length
    ? analysis.analysis.dataGaps.map((item) => ({ label: item, detail: "Action recommended" }))
    : analysis?.analysis?.nextSteps?.length
      ? analysis.analysis.nextSteps.map((item) => ({ label: item, detail: "Next step" }))
      : fallbackChecklistItems

  const riskTrend = useMemo(() => {
    if (!riskHistory.length) return fallbackRiskTrend
    const recent = [...riskHistory].slice(0, 6).reverse()
    return recent.map((item) => {
      const date = item.assessmentDate ? new Date(item.assessmentDate) : null
      const month = date
        ? date.toLocaleDateString("en-US", { month: "short" })
        : "--"
      return {
        month,
        risk: item.riskScore ?? 0,
      }
    })
  }, [riskHistory])

  const factorImpact = useMemo(() => {
    if (!analysisReady) return fallbackFactorImpact
    const gaps = analysis?.analysis?.dataGaps ?? []
    const hasGap = (needle: string) =>
      gaps.some((gap) => gap.toLowerCase().includes(needle))
    return [
      { name: "Vitals", impact: hasGap("vitals") ? 12 : 32 },
      { name: "Symptoms", impact: hasGap("symptoms") ? 12 : 22 },
      { name: "Records", impact: hasGap("records") ? 12 : 26 },
      { name: "Imaging", impact: hasGap("imaging") ? 12 : 20 },
    ]
  }, [analysisReady, analysis])

  const analysisSections = useMemo(() => {
    const sections = analysis?.analysis?.sections
    if (!sections) {
      return [
        { title: "Vitals analysis", content: "Run full analysis to see vitals interpretation." },
        { title: "Symptoms analysis", content: "Run full analysis to see symptom interpretation." },
        { title: "Records analysis", content: "Run full analysis to see record insights." },
        { title: "Medications analysis", content: "Run full analysis to see medication insights." },
        { title: "Allergies analysis", content: "Run full analysis to see allergy insights." },
        { title: "Immunizations analysis", content: "Run full analysis to see immunization insights." },
      ]
    }
    return [
      { title: "Vitals analysis", content: sections.vitals ?? "No vitals insights available." },
      { title: "Symptoms analysis", content: sections.symptoms ?? "No symptom insights available." },
      { title: "Records analysis", content: sections.records ?? "No record insights available." },
      { title: "Medications analysis", content: sections.medications ?? "No medication insights available." },
      { title: "Allergies analysis", content: sections.allergies ?? "No allergy insights available." },
      { title: "Immunizations analysis", content: sections.immunizations ?? "No immunization insights available." },
    ]
  }, [analysis])

  const lastUpdatedLabel = formatDate(
    analysis?.analysis?.generatedAt ?? analysis?.assessmentDate,
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-[linear-gradient(135deg,#1F7AE0_0%,#185FB0_100%)] text-primary-foreground shadow-xl dark:border-border dark:bg-[linear-gradient(135deg,oklch(0.21_0_0)_0%,oklch(0.18_0_0)_100%)]">
            <div className="relative px-8 py-7">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">
                    Vaidya Intelligence
                  </p>
                  <h1 className="text-3xl font-semibold sm:text-4xl">Full Risk Analysis</h1>
                  <p className="max-w-2xl text-sm text-white/75">
                    Comprehensive review of vitals, symptoms, records, medications, and history.
                    Run the analysis to refresh scores and unlock your report.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                    <span className="rounded-full border border-white/20 px-3 py-1">
                      Sources: Vitals, Symptoms, Records, Imaging
                    </span>
                    <span className="rounded-full border border-white/20 px-3 py-1">
                      Last analyzed: {lastUpdatedLabel}
                    </span>
                    {analysis?.predictedCondition ? (
                      <span className="rounded-full border border-white/20 px-3 py-1">
                        Primary focus: {analysis.predictedCondition}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                  <Button
                    className="h-11 rounded-full bg-white text-primary shadow-sm hover:bg-white/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
                    onClick={handleRunAnalysis}
                    disabled={analysisPending}
                  >
                    {analysisPending ? "Running analysis..." : "Run full analysis"}
                  </Button>
                  <RiskAnalysisReportButton
                    assessment={analysis ?? undefined}
                    insights={analysisInsights}
                    disabled={!analysisReady}
                    className="h-11 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white disabled:opacity-60 disabled:text-white/80"
                  />
                </div>
              </div>
            </div>
            <div className="relative border-t border-white/15 px-8 pb-8 pt-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-wider text-white/70">
                      {tile.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{tile.value}</p>
                    <p className="text-xs text-white/60">{tile.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Disease modules</h2>
              <p className="text-sm text-muted-foreground">
                Open a prediction module to run disease-specific analysis.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-4">
              {diseaseProfiles.map((profile) => {
                const Icon = profile.icon

                return (
                  <Card key={profile.key} className="rounded-3xl border border-border bg-card shadow-sm">
                    <CardHeader className="pb-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-foreground">
                            {profile.name}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            {profile.status}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {profile.factors.map((factor) => (
                          <div key={factor} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                      <Button asChild variant="outline" className="w-full rounded-full">
                        <Link href={profile.href}>Open prediction</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
            <div className="space-y-5">
              <Card className="rounded-3xl border border-border bg-card shadow-sm">
                <CardHeader className="pb-1">
                  <CardTitle className="text-base font-semibold text-foreground">Risk trajectory</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Composite risk over the last six months.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {analysisReady ? (
                    <ChartContainer
                      className="h-60 w-full"
                      config={{ risk: { label: "Risk", color: PRIMARY } }}
                    >
                      <AreaChart data={riskTrend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
                            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickMargin={8}
                        />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="risk"
                          stroke={PRIMARY}
                          fill="url(#riskFill)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                      Run full analysis to view the risk trajectory.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-border bg-card shadow-sm">
                <CardHeader className="pb-1">
                  <CardTitle className="text-base font-semibold text-foreground">Signal contribution</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Weighted influence of each data group in the model.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {analysisReady ? (
                    <ChartContainer
                      className="h-52 w-full"
                      config={{ impact: { label: "Impact", color: PRIMARY } }}
                    >
                      <BarChart data={factorImpact} margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="impact" radius={[10, 10, 10, 10]} fill={PRIMARY} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                      Signal contribution appears after analysis.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-4">
              <Card className="rounded-3xl border border-border bg-card shadow-sm">
                <CardHeader className="pb-1">
                  <CardTitle className="text-base font-semibold text-foreground">Key signals</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Signals used in the current analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {keySignals.map((signal) => (
                    <div key={signal.label} className="rounded-2xl border border-border bg-muted/40 px-3 py-2">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{signal.label}</p>
                      <p className="text-sm font-medium text-foreground">{signal.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-border bg-card shadow-sm">
                <CardHeader className="pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">AI insights</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Alerts and improvement opportunities.
                      </CardDescription>
                    </div>
                    {analysisReady ? (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                          Alerts {alertInsights.length}
                        </span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Improve {improvementInsights.length}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!analysisReady ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                      Run full analysis to view AI insights.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <p className="uppercase tracking-wider">Alerts</p>
                          <span>High/Medium priority</span>
                        </div>
                        {alertInsights.length ? (
                          <div className="space-y-2">
                            {alertInsights.slice(0, 3).map((insight) => (
                              <div
                                key={insight._id}
                                className="flex items-start gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/60 px-3 py-2 dark:border-rose-900 dark:bg-rose-950/30"
                              >
                                <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-foreground">
                                    {insight.insightTitle}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                                </div>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${insightTone[insight.priority ?? "Info"]}`}
                                >
                                  {insight.priority ?? "Info"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No critical alerts detected.</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <p className="uppercase tracking-wider">Improving health</p>
                          <span>Low/Info priority</span>
                        </div>
                        {improvementInsights.length ? (
                          <div className="space-y-2">
                            {improvementInsights.slice(0, 3).map((insight) => (
                              <div
                                key={insight._id}
                                className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 px-3 py-2"
                              >
                                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-foreground">
                                    {insight.insightTitle}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                                </div>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${insightTone[insight.priority ?? "Info"]}`}
                                >
                                  {insight.priority ?? "Info"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No improvement insights yet.</p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>


            </aside>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Full analysis</h2>
              <p className="text-sm text-muted-foreground">
                Detailed interpretation across vitals, symptoms, records, medications, and history.
              </p>
            </div>
            <Card className="rounded-3xl border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <CardTitle className="text-base font-semibold text-foreground">Overall summary</CardTitle>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadgeStyles[resolvedRiskLevel]}`}
                >
                  {resolvedRiskLabel}
                </span>
              </CardHeader>
              <CardContent className="pt-1 text-sm leading-relaxed text-muted-foreground">
                {analysis?.analysis?.summary ?? "Run full analysis to generate a summary."}
              </CardContent>
            </Card>
            <div className="grid gap-3 lg:grid-cols-3">
              {analysisSections.map((section) => (
                <Card key={section.title} className="rounded-3xl border border-border bg-card shadow-sm">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base font-semibold text-foreground">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">
                    {section.content}
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

