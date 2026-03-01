"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, HeartPulse, Sparkles } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getFamilyGroupSummary } from "@/lib/actions/family-action"
import { getAllergies } from "@/lib/actions/allergy-action"
import { getMedications } from "@/lib/actions/medications-action"
import { getMedicalRecords } from "@/lib/actions/medical-record-action"
import { getUserData } from "@/lib/actions/user-data-action"
import type { UserData } from "@/lib/actions/user-data-action"
import type { TAllergy, TMedication, TMedicalRecord } from "@/lib/definition"
import { getInitials, statusMeta } from "../../_data/family-data"

const PRIMARY = "#1F7AE0"
const SECONDARY = "#4DA3FF"
const TERTIARY = "#9CC7FF"

const formatDate = (value?: string | null) => {
  if (!value) return "--"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "--"
  return date.toLocaleDateString()
}

const formatValue = (value?: number | null, suffix?: string) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "--"
  return `${value}${suffix ?? ""}`
}

const formatName = (value?: string | null) => {
  if (!value) return "Member"
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

const mergeVitals = (base?: any | null, override?: any | null) => {
  if (!base && !override) return null
  const pickNumber = (next?: number | null, prev?: number | null) => {
    if (typeof next === "number") return next
    if (typeof prev === "number") return prev
    return undefined
  }
  return {
    recordedAt: override?.recordedAt ?? base?.recordedAt ?? null,
    systolicBp: pickNumber(override?.systolicBp, base?.systolicBp),
    diastolicBp: pickNumber(override?.diastolicBp, base?.diastolicBp),
    glucoseLevel: pickNumber(override?.glucoseLevel, base?.glucoseLevel),
    heartRate: pickNumber(override?.heartRate, base?.heartRate),
    weight: pickNumber(override?.weight, base?.weight),
    height: pickNumber(override?.height, base?.height),
    bmi: pickNumber(override?.bmi, base?.bmi),
  }
}

export default function FamilyMemberPage() {
  const router = useRouter()
  const params = useParams()
  const memberId = typeof params?.memberId === "string" ? params.memberId : ""

  const [members, setMembers] = useState<Array<any>>([])
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "member">("member")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<TMedicalRecord[]>([])
  const [medicalRecordsPage, setMedicalRecordsPage] = useState(1)
  const [medicalRecordsTotalPages, setMedicalRecordsTotalPages] = useState(1)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [allergies, setAllergies] = useState<TAllergy[]>([])
  const [medications, setMedications] = useState<TMedication[]>([])
  const [vitalsPage, setVitalsPage] = useState(1)

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true)
      const result = await getFamilyGroupSummary()
      if (result.success && result.data) {
        setMembers(result.data.members || [])
        if (result.data.currentUser?.role) {
          setCurrentUserRole(result.data.currentUser.role)
        }
        if (result.data.currentUser?.id) {
          setCurrentUserId(result.data.currentUser.id)
        }
      }
      setLoading(false)
    }

    loadSummary()
  }, [])

  useEffect(() => {
    if (!currentUserId) return
    const loadUserData = async () => {
      const result = await getUserData()
      if (result.success && result.data) {
        setUserData(result.data)
      }
    }
    loadUserData()
  }, [currentUserId])

  useEffect(() => {
    setVitalsPage(1)
    setMedicalRecordsPage(1)
  }, [memberId])

  useEffect(() => {
    const canView = memberId && memberId === currentUserId
    if (!canView) {
      setMedicalRecords([])
      setMedicalRecordsTotalPages(1)
      setRecordsLoading(false)
      return
    }
    setRecordsLoading(true)
    const loadRecords = async () => {
      try {
        const result = await getMedicalRecords({ page: medicalRecordsPage, limit: 4 })
        if (result.success && result.data) {
          setMedicalRecords(result.data)
          setMedicalRecordsTotalPages(result.pagination?.totalPages ?? 1)
        } else {
          setMedicalRecords([])
          setMedicalRecordsTotalPages(1)
        }
      } finally {
        setRecordsLoading(false)
      }
    }
    loadRecords()
  }, [memberId, currentUserId, medicalRecordsPage])

  useEffect(() => {
    const canView = memberId && memberId === currentUserId
    if (!canView) {
      setAllergies([])
      setMedications([])
      return
    }
    const loadMemberDetails = async () => {
      const [allergyResult, medicationResult] = await Promise.all([
        getAllergies(),
        getMedications(),
      ])
      setAllergies(allergyResult.success ? allergyResult.data ?? [] : [])
      setMedications(medicationResult.success ? medicationResult.data ?? [] : [])
    }
    loadMemberDetails()
  }, [memberId, currentUserId])

  const member = useMemo(
    () => members.find((item) => item.userId === memberId) ?? members[0],
    [members, memberId]
  )

  const currentUserVitals = useMemo(
    () => userData?.vitals ?? userData?.latestVitals ?? null,
    [userData],
  )

  const resolveMemberVitals = (target?: any) => {
    if (!target) return null
    const base = target.latestVitals ?? target.recentVitals?.[0] ?? null
    if (target.userId && target.userId === currentUserId) {
      return mergeVitals(base, currentUserVitals)
    }
    return base
  }

  const canViewMemberDetails = Boolean(member?.userId && member.userId === currentUserId)

  const familyAvgScore = useMemo(() => {
    if (!members.length) return 0
    return Math.round(
      members.reduce((sum, item) => sum + (item.healthScore ?? 0), 0) / members.length
    )
  }, [members])

  const scoreComparisonData = useMemo(
    () => [
      { name: "Member", score: member?.healthScore ?? 0 },
      { name: "Family Avg", score: familyAvgScore ?? 0 },
    ],
    [member, familyAvgScore]
  )

  const vitalsMetricData = useMemo(() => {
    const vitals = resolveMemberVitals(member)
    return [
      { name: "Systolic", value: vitals?.systolicBp ?? 0 },
      { name: "Diastolic", value: vitals?.diastolicBp ?? 0 },
      { name: "Heart rate", value: vitals?.heartRate ?? 0 },
      { name: "Glucose", value: vitals?.glucoseLevel ?? 0 },
    ]
  }, [member, currentUserId, currentUserVitals])

  const vitalsTrendData = useMemo(() => {
    const history = member?.recentVitals ?? []
    const ordered = [...history].reverse()
    return ordered.map((entry, index) => ({
      label: entry.recordedAt ? formatDate(entry.recordedAt) : `Entry ${index + 1}`,
      heartRate: entry.heartRate ?? null,
      systolic: entry.systolicBp ?? null,
      glucose: entry.glucoseLevel ?? null,
    }))
  }, [member])

  const vitalsHistory = useMemo(() => {
    const items = member?.recentVitals ?? []
    return [...items].sort((a, b) => {
      const aDate = new Date(a.recordedAt ?? a.createdAt ?? 0).getTime()
      const bDate = new Date(b.recordedAt ?? b.createdAt ?? 0).getTime()
      return bDate - aDate
    })
  }, [member])

  const vitalsPerPage = 4
  const vitalsTotalPages = Math.max(1, Math.ceil(vitalsHistory.length / vitalsPerPage))
  const pagedVitals = useMemo(() => {
    const start = (vitalsPage - 1) * vitalsPerPage
    return vitalsHistory.slice(start, start + vitalsPerPage)
  }, [vitalsHistory, vitalsPage])

  useEffect(() => {
    if (vitalsPage > vitalsTotalPages) {
      setVitalsPage(vitalsTotalPages)
    }
  }, [vitalsPage, vitalsTotalPages])

  useEffect(() => {
    if (medicalRecordsPage > medicalRecordsTotalPages) {
      setMedicalRecordsPage(medicalRecordsTotalPages)
    }
  }, [medicalRecordsPage, medicalRecordsTotalPages])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
            <CardContent className="py-10 text-center text-sm text-slate-500">
              Loading member profile...
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
            <CardContent className="py-10 text-center text-sm text-slate-500">
              Member not found.
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const meta = statusMeta[member.status || "warning"]
  const vitals = resolveMemberVitals(member)
  const bp = vitals?.systolicBp && vitals?.diastolicBp
    ? `${vitals.systolicBp}/${vitals.diastolicBp}`
    : "--"
  const vitalsSummary = `BP ${bp} | HR ${formatValue(vitals?.heartRate)} | Glucose ${formatValue(vitals?.glucoseLevel)}`

  const relationLabel =
    member.userId === currentUserId
      ? "Self"
      : member.relation?.trim()
        ? member.relation
        : "Member"
  const displayRelation =
    relationLabel?.toLowerCase() === "self" && member.userId !== currentUserId
      ? "Admin"
      : relationLabel

  const insights = [
    {
      title: "AI review focus",
      detail: "Recent vitals suggest attention on stability and recovery cadence.",
    },
    {
      title: "Care coordination",
      detail: "Next check-in recommended within 7 days based on activity levels.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/family-health" className="text-sm font-semibold text-primary">
              Back to family overview
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={meta.badge}>{meta.label}</Badge>
              <Badge className="bg-blue-50 text-blue-700">Vitals {vitalsSummary}</Badge>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
            <Card className="rounded-3xl border-0 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-base font-semibold text-slate-700">
                      {getInitials(formatName(member.name))}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                        {formatName(member.name)}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-500">
                        {displayRelation} | {member.age ?? "--"} yrs | Last update {formatDate(member.lastUpdated)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    {currentUserRole === "admin" ? (
                      <Select
                        value={member.userId}
                        onValueChange={(value) => router.push(`/family-health/members/${value}`)}
                      >
                        <SelectTrigger className="h-9 rounded-xl border-slate-200/70 bg-white text-xs font-semibold text-slate-700">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {members.map((item) => {
                            const relation =
                              item.userId === currentUserId
                                ? "Self"
                                : item.relation?.trim()
                                  ? item.relation
                                  : "Member"
                            const label =
                              relation.toLowerCase() === "self" && item.userId !== currentUserId
                                ? "Admin"
                                : relation
                            return (
                            <SelectItem key={item.userId} value={item.userId}>
                              {formatName(item.name)} ({label})
                            </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    ) : null}
                    <Badge className={meta.badge}>{meta.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <Tabs defaultValue="overview" className="space-y-5">
                  <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="vitals">Vitals history</TabsTrigger>
                    <TabsTrigger value="records">Medical records</TabsTrigger>
                    <TabsTrigger value="allergies">Allergies</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="ai">AI consults</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-5 lg:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50/80 px-4 py-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Latest vitals</p>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span>Blood pressure</span>
                            <span className="font-semibold text-slate-900">{bp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Heart rate</span>
                            <span className="font-semibold text-slate-900">{formatValue(vitals?.heartRate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Glucose</span>
                            <span className="font-semibold text-slate-900">{formatValue(vitals?.glucoseLevel)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>BMI</span>
                            <span className="font-semibold text-slate-900">{formatValue(vitals?.bmi)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50/80 px-4 py-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Profile info</p>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span>Age</span>
                            <span className="font-semibold text-slate-900">{member.age ?? "--"} yrs</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Gender</span>
                            <span className="font-semibold text-slate-900">{member.gender ?? "--"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Health score</span>
                            <span className="font-semibold text-slate-900">{member.healthScore ?? "--"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50/80 px-4 py-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Active alerts</p>
                        <div className="mt-2 space-y-2 text-sm text-slate-600">
                          {member.status === "critical" ? (
                            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                              <AlertTriangle className="h-4 w-4" />
                              Immediate follow-up recommended.
                            </div>
                          ) : member.status === "warning" ? (
                            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                              <AlertTriangle className="h-4 w-4" />
                              Monitor vitals in the next 24 hours.
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                              <HeartPulse className="h-4 w-4" />
                              Stable vitals in the last 7 days.
                            </div>
                          )}
                          <p className="text-xs text-slate-500">
                            Alerts are recalculated after each vitals upload.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold text-slate-900">Vitals snapshot</CardTitle>
                          <CardDescription className="text-sm text-slate-500">
                            Latest key vitals for this member.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <ChartContainer
                            className="h-52 w-full"
                            config={{ value: { label: "Vitals", color: SECONDARY } }}
                          >
                            <BarChart data={vitalsMetricData} margin={{ left: -10, right: 12, top: 12, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                tickMargin={8}
                              />
                              <YAxis hide />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="value" fill={SECONDARY} radius={[10, 10, 10, 10]} />
                              <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>

                      <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold text-slate-900">Score comparison</CardTitle>
                          <CardDescription className="text-sm text-slate-500">
                            Member score vs family average.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <ChartContainer
                            className="h-52 w-full"
                            config={{ score: { label: "Score", color: PRIMARY } }}
                          >
                            <LineChart data={scoreComparisonData} margin={{ left: -10, right: 12, top: 12, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                tickMargin={8}
                              />
                              <YAxis hide />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke={PRIMARY}
                                strokeWidth={2}
                                dot={{ r: 4, fill: PRIMARY }}
                                activeDot={{ r: 5 }}
                              />
                            </LineChart>
                          </ChartContainer>
                          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                            Family average score: {familyAvgScore || "--"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="vitals" className="space-y-4">
                    {vitalsTrendData.length ? (
                      <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-semibold text-slate-900">Vitals trend</CardTitle>
                          <CardDescription className="text-sm text-slate-500">
                            Recent heart rate, systolic BP, and glucose readings.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer
                            className="h-56 w-full"
                            config={{
                              heartRate: { label: "Heart rate", color: PRIMARY },
                              systolic: { label: "Systolic", color: SECONDARY },
                              glucose: { label: "Glucose", color: TERTIARY },
                            }}
                          >
                            <AreaChart data={vitalsTrendData} margin={{ left: -10, right: 12, top: 12, bottom: 0 }}>
                              <defs>
                                <linearGradient id="memberHeartRateGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.12} />
                                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="memberSystolicGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={SECONDARY} stopOpacity={0.12} />
                                  <stop offset="100%" stopColor={SECONDARY} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="memberGlucoseGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={TERTIARY} stopOpacity={0.12} />
                                  <stop offset="100%" stopColor={TERTIARY} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                tickMargin={8}
                              />
                              <YAxis hide />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Area
                                type="monotone"
                                dataKey="heartRate"
                                stroke={PRIMARY}
                                fill="url(#memberHeartRateGradient)"
                                fillOpacity={1}
                                strokeWidth={1.6}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                connectNulls
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, fill: "white", stroke: PRIMARY }}
                              />
                              <Area
                                type="monotone"
                                dataKey="systolic"
                                stroke={SECONDARY}
                                fill="url(#memberSystolicGradient)"
                                fillOpacity={1}
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                connectNulls
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, fill: "white", stroke: SECONDARY }}
                              />
                              <Area
                                type="monotone"
                                dataKey="glucose"
                                stroke={TERTIARY}
                                fill="url(#memberGlucoseGradient)"
                                fillOpacity={1}
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                connectNulls
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, fill: "white", stroke: TERTIARY }}
                              />
                              <ChartLegend content={<ChartLegendContent />} />
                            </AreaChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    ) : null}

                    {vitalsHistory.length ? (
                      <div className="space-y-3">
                        <div className="hidden md:block">
                          <div className="rounded-2xl border border-slate-200/70">
                            <Table className="table-fixed">
                              <TableHeader>
                                <TableRow className="border-b border-slate-200 bg-slate-50/60">
                                  <TableHead className="w-[140px] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Date
                                  </TableHead>
                                  <TableHead className="w-[90px] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Heart
                                  </TableHead>
                                  <TableHead className="w-[120px] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    BP
                                  </TableHead>
                                  <TableHead className="w-[120px] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Glucose
                                  </TableHead>
                                  <TableHead className="w-[90px] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    BMI
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {pagedVitals.map((entry, index) => {
                                  const entryDate = entry.recordedAt ?? entry.createdAt
                                  const bp = entry.systolicBp && entry.diastolicBp
                                    ? `${entry.systolicBp}/${entry.diastolicBp}`
                                    : "--"
                                  return (
                                    <TableRow key={`${entry.recordedAt ?? entry.createdAt ?? index}`} className="border-b border-slate-200 hover:bg-slate-50/50">
                                      <TableCell className="text-sm text-slate-600">
                                        {entryDate ? formatDate(entryDate) : "--"}
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-900">
                                        {formatValue(entry.heartRate)}
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-900">{bp}</TableCell>
                                      <TableCell className="text-sm text-slate-900">
                                        {formatValue(entry.glucoseLevel)}
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-900">
                                        {formatValue(entry.bmi)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <div className="grid gap-3 md:hidden">
                          {pagedVitals.map((entry, index) => {
                            const entryDate = entry.recordedAt ?? entry.createdAt
                            const bp = entry.systolicBp && entry.diastolicBp
                              ? `${entry.systolicBp}/${entry.diastolicBp}`
                              : "--"
                            return (
                              <div key={`${entry.recordedAt ?? entry.createdAt ?? index}`} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>{entryDate ? formatDate(entryDate) : "--"}</span>
                                  <span>BP {bp}</span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-600">
                                  <div>HR: <span className="font-semibold text-slate-900">{formatValue(entry.heartRate)}</span></div>
                                  <div>Glucose: <span className="font-semibold text-slate-900">{formatValue(entry.glucoseLevel)}</span></div>
                                  <div>BMI: <span className="font-semibold text-slate-900">{formatValue(entry.bmi)}</span></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {vitalsTotalPages > 1 ? (
                          <div className="flex items-center justify-between border-t border-slate-200 px-2 pt-3 text-sm text-slate-500">
                            <span>
                              Page {vitalsPage} of {vitalsTotalPages}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={vitalsPage === 1}
                                onClick={() => setVitalsPage((prev) => Math.max(1, prev - 1))}
                              >
                                Prev
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={vitalsPage === vitalsTotalPages}
                                onClick={() => setVitalsPage((prev) => Math.min(vitalsTotalPages, prev + 1))}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        No vitals history recorded yet.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="records" className="space-y-3">
                    {!canViewMemberDetails ? (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Medical records are available only to the member.
                      </div>
                    ) : recordsLoading ? (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Loading medical records...
                      </div>
                    ) : medicalRecords.length ? (
                      <div className="space-y-3">
                        <div className="hidden md:block">
                          <div className="rounded-2xl border border-slate-200/70">
                            <Table className="table-fixed">
                              <TableHeader>
                                <TableRow className="border-b border-slate-200 bg-slate-50/60">
                                  <TableHead className="w-[40%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Record
                                  </TableHead>
                                  <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Type
                                  </TableHead>
                                  <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Date
                                  </TableHead>
                                  <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Status
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {medicalRecords.map((record) => {
                                  const recordDate = record.recordDate ?? record.createdAt
                                  return (
                                    <TableRow key={record._id} className="border-b border-slate-200 hover:bg-slate-50/50">
                                      <TableCell className="text-sm text-slate-900">
                                        {record.title || "Medical record"}
                                        <p className="text-xs text-slate-500">{record.provider ?? "Provider not set"}</p>
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-600">
                                        {record.recordType ?? record.category ?? "--"}
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-600">
                                        {recordDate ? formatDate(recordDate) : "--"}
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-600">
                                        {record.status ?? "Active"}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                        <div className="grid gap-3 md:hidden">
                          {medicalRecords.map((record) => {
                            const recordDate = record.recordDate ?? record.createdAt
                            return (
                              <div key={record._id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>{recordDate ? formatDate(recordDate) : "--"}</span>
                                  <span>{record.status ?? "Active"}</span>
                                </div>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{record.title || "Medical record"}</p>
                                <p className="text-xs text-slate-500">{record.recordType ?? record.category ?? "General"}</p>
                              </div>
                            )
                          })}
                        </div>
                        {medicalRecordsTotalPages > 1 ? (
                          <div className="flex items-center justify-between border-t border-slate-200 px-2 pt-3 text-sm text-slate-500">
                            <span>
                              Page {medicalRecordsPage} of {medicalRecordsTotalPages}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={medicalRecordsPage === 1}
                                onClick={() => setMedicalRecordsPage((prev) => Math.max(1, prev - 1))}
                              >
                                Prev
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                disabled={medicalRecordsPage === medicalRecordsTotalPages}
                                onClick={() =>
                                  setMedicalRecordsPage((prev) => Math.min(medicalRecordsTotalPages, prev + 1))
                                }
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        No medical records available yet.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="allergies" className="space-y-3">
                    {!canViewMemberDetails ? (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Allergy details are available only to the member.
                      </div>
                    ) : allergies.length ? (
                      <div className="rounded-2xl border border-slate-200/70">
                        <Table className="table-fixed">
                          <TableHeader>
                            <TableRow className="border-b border-slate-200 bg-slate-50/60">
                              <TableHead className="w-[35%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Allergen
                              </TableHead>
                              <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Severity
                              </TableHead>
                              <TableHead className="w-[25%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Reaction
                              </TableHead>
                              <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Status
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allergies.map((allergy) => (
                              <TableRow key={allergy._id} className="border-b border-slate-200 hover:bg-slate-50/50">
                                <TableCell className="text-sm text-slate-900">{allergy.allergen}</TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {allergy.severity ?? "--"}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {allergy.reaction ?? "--"}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {allergy.status ?? "active"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        No allergies recorded yet.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="medications" className="space-y-3">
                    {!canViewMemberDetails ? (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Medication details are available only to the member.
                      </div>
                    ) : medications.length ? (
                      <div className="rounded-2xl border border-slate-200/70">
                        <Table className="table-fixed">
                          <TableHeader>
                            <TableRow className="border-b border-slate-200 bg-slate-50/60">
                              <TableHead className="w-[35%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Medication
                              </TableHead>
                              <TableHead className="w-[25%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Dosage
                              </TableHead>
                              <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Frequency
                              </TableHead>
                              <TableHead className="w-[20%] text-xs font-medium uppercase tracking-wider text-slate-500">
                                Duration
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {medications.map((medication) => (
                              <TableRow key={medication._id} className="border-b border-slate-200 hover:bg-slate-50/50">
                                <TableCell className="text-sm text-slate-900">{medication.medicineName}</TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {medication.dosage ?? "--"}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {medication.frequency ?? "--"}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {medication.durationDays ? `${medication.durationDays} days` : "--"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        No medications recorded yet.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ai" className="space-y-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      AI consultation history will appear after the member completes sessions.
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <aside className="space-y-4">
              <Card className="rounded-3xl border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Member AI insights</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Personalized guidance based on recent data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((insight) => (
                    <div key={insight.title} className="rounded-2xl bg-blue-50/70 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                          <p className="text-xs text-slate-500">{insight.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">Care checklist</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Immediate next steps for this profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Vitals follow-up</p>
                      <p>Capture a new vitals entry within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Review medications</p>
                      <p>Confirm medication adherence and dosage accuracy.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-full">
                    Start AI consult
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </section>
        </div>
      </div>
    </div>
  )
}
