
"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  AlertTriangle,
  Check,
  Copy,
  Link as LinkIcon,
  Mail,
  PencilLine,
  Plus,
  ShieldAlert,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  addFamilyMemberById,
  createFamilyGroup,
  createFamilyInvite,
  getFamilyGroupSummary,
  joinFamilyInvite,
  updateFamilyMemberRelation,
} from "@/lib/actions/family-action"
import { getAllergies } from "@/lib/actions/allergy-action"
import { getMedications } from "@/lib/actions/medications-action"
import { getMedicalRecords } from "@/lib/actions/medical-record-action"
import { getUserData } from "@/lib/actions/user-data-action"
import type { UserData } from "@/lib/actions/user-data-action"
import type { TAllergy, TMedication, TMedicalRecord } from "@/lib/definition"
import { getInitials, statusMeta } from "./_data/family-data"

const PRIMARY = "#1F7AE0"
const SECONDARY = "#4DA3FF"

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

const getLastName = (value?: string | null) => {
  if (!value) return ""
  const parts = formatName(value).split(" ").filter(Boolean)
  return parts[parts.length - 1] || ""
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

const normalizeRelation = (value?: string | null) => {
  const relation = value?.trim().toLowerCase() ?? ""
  const aliasMap: Record<string, string> = {
    dad: "father",
    papa: "father",
    mom: "mother",
    mum: "mother",
    mommy: "mother",
    mummy: "mother",
    spouse: "spouse",
    partner: "spouse",
    me: "self",
    self: "self",
  }
  return aliasMap[relation] ?? relation
}

const normalizeGender = (value?: string | null) => {
  const gender = value?.trim().toLowerCase() ?? ""
  if (gender.startsWith("m")) return "male"
  if (gender.startsWith("f")) return "female"
  return ""
}

const titleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) =>
      part
        .split("-")
        .map((segment) =>
          segment ? `${segment.charAt(0).toUpperCase()}${segment.slice(1)}` : "",
        )
        .join("-"),
    )
    .join(" ")

const pickGenderedLabel = (
  gender: string,
  labels: { male: string; female: string; neutral: string },
) => {
  if (gender === "male") return labels.male
  if (gender === "female") return labels.female
  return labels.neutral
}

const getRelativeRelationLabel = (
  viewerRelationRaw?: string | null,
  targetRelationRaw?: string | null,
  targetGender?: string | null,
) => {
  const viewerRelation = normalizeRelation(viewerRelationRaw)
  const targetRelation = normalizeRelation(targetRelationRaw)
  if (!viewerRelation || !targetRelation) return ""
  if (viewerRelation === "self") return ""

  const gender = normalizeGender(targetGender)
  const childLabel = pickGenderedLabel(gender, {
    male: "Son",
    female: "Daughter",
    neutral: "Child",
  })
  const parentLabel = pickGenderedLabel(gender, {
    male: "Father",
    female: "Mother",
    neutral: "Parent",
  })
  const spouseLabel = pickGenderedLabel(gender, {
    male: "Husband",
    female: "Wife",
    neutral: "Spouse",
  })
  const siblingLabel = pickGenderedLabel(gender, {
    male: "Brother",
    female: "Sister",
    neutral: "Sibling",
  })
  const grandchildLabel = pickGenderedLabel(gender, {
    male: "Grandson",
    female: "Granddaughter",
    neutral: "Grandchild",
  })
  const grandparentLabel = pickGenderedLabel(gender, {
    male: "Grandfather",
    female: "Grandmother",
    neutral: "Grandparent",
  })
  const inLawParentLabel = pickGenderedLabel(gender, {
    male: "Father-in-law",
    female: "Mother-in-law",
    neutral: "Parent-in-law",
  })
  const inLawSiblingLabel = pickGenderedLabel(gender, {
    male: "Brother-in-law",
    female: "Sister-in-law",
    neutral: "Sibling-in-law",
  })
  const inLawChildLabel = pickGenderedLabel(gender, {
    male: "Son-in-law",
    female: "Daughter-in-law",
    neutral: "Child-in-law",
  })
  const auntUncleLabel = pickGenderedLabel(gender, {
    male: "Uncle",
    female: "Aunt",
    neutral: "Aunt/Uncle",
  })
  const nieceNephewLabel = pickGenderedLabel(gender, {
    male: "Nephew",
    female: "Niece",
    neutral: "Niece/Nephew",
  })

  switch (viewerRelation) {
    case "father":
    case "mother":
      if (targetRelation === "self") return childLabel
      if (targetRelation === "father" || targetRelation === "mother") return spouseLabel
      if (targetRelation === "brother" || targetRelation === "sister") return childLabel
      if (targetRelation === "son" || targetRelation === "daughter") return grandchildLabel
      if (targetRelation === "husband" || targetRelation === "wife" || targetRelation === "spouse") {
        return inLawChildLabel
      }
      return ""
    case "son":
    case "daughter":
      if (targetRelation === "self") return parentLabel
      if (targetRelation === "father" || targetRelation === "mother") return grandparentLabel
      if (targetRelation === "brother" || targetRelation === "sister") return auntUncleLabel
      if (targetRelation === "husband" || targetRelation === "wife" || targetRelation === "spouse") {
        return parentLabel
      }
      return ""
    case "husband":
    case "wife":
    case "spouse":
      if (targetRelation === "self") return spouseLabel
      if (targetRelation === "father" || targetRelation === "mother") return inLawParentLabel
      if (targetRelation === "brother" || targetRelation === "sister") return inLawSiblingLabel
      if (targetRelation === "son" || targetRelation === "daughter") return childLabel
      return ""
    case "brother":
    case "sister":
      if (targetRelation === "self") return siblingLabel
      if (targetRelation === "father" || targetRelation === "mother") return parentLabel
      if (targetRelation === "son" || targetRelation === "daughter") return nieceNephewLabel
      if (targetRelation === "husband" || targetRelation === "wife" || targetRelation === "spouse") {
        return inLawSiblingLabel
      }
      if (targetRelation === "brother" || targetRelation === "sister") return siblingLabel
      return ""
    default:
      return ""
  }
}

const formatStoredRelation = (relation: string) => {
  if (relation === "self") return "Admin"
  return titleCase(relation)
}

const extractInviteToken = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const match = trimmed.match(/token=([a-z0-9]+)/i)
  if (match?.[1]) return match[1]
  return trimmed
}

export default function FamilyHealthPage() {
  const router = useRouter()
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "member">("member")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [groupName, setGroupName] = useState("Family Health")
  const [members, setMembers] = useState<Array<any>>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [relationDraft, setRelationDraft] = useState("")
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false)
  const [joinGroupOpen, setJoinGroupOpen] = useState(false)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)

  const [inviteLink, setInviteLink] = useState("")
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null)
  const [userIdInput, setUserIdInput] = useState("")
  const [relationInput, setRelationInput] = useState("")
  const [joinInviteInput, setJoinInviteInput] = useState("")
  const [joinRelationInput, setJoinRelationInput] = useState("")
  const [createGroupName, setCreateGroupName] = useState("Family Health")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<TMedicalRecord[]>([])
  const [medicalRecordsPage, setMedicalRecordsPage] = useState(1)
  const [medicalRecordsTotalPages, setMedicalRecordsTotalPages] = useState(1)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [allergies, setAllergies] = useState<TAllergy[]>([])
  const [medications, setMedications] = useState<TMedication[]>([])
  const [vitalsPage, setVitalsPage] = useState(1)

  const [createPending, startCreateTransition] = useTransition()
  const [invitePending, startInviteTransition] = useTransition()
  const [joinPending, startJoinTransition] = useTransition()
  const [memberPending, startMemberTransition] = useTransition()
  const [relationPending, startRelationTransition] = useTransition()
  const isAdmin = currentUserRole === "admin"
  const showAdminActions = Boolean(groupId) && isAdmin
  const showGroupActions = !groupId && !loading

  const loadSummary = async () => {
    setLoading(true)
    const result = await getFamilyGroupSummary()
    if (result.success && result.data) {
      setGroupId(result.data.group._id)
      setGroupName(result.data.group.name || "Family Health")
      setMembers(result.data.members || [])
      if (result.data.currentUser?.role) {
        setCurrentUserRole(result.data.currentUser.role)
      }
      if (result.data.currentUser?.id) {
        setCurrentUserId(result.data.currentUser.id)
      }
      const initialMemberId =
        result.data.currentUser?.id || result.data.members?.[0]?.userId || ""
      if (initialMemberId) {
        setSelectedMemberId((prev) => prev || initialMemberId)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
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

  const selectedMember = useMemo(() => {
    const activeId = selectedMemberId || currentUserId
    return members.find((member) => member.userId === activeId) ?? members[0]
  }, [members, selectedMemberId, currentUserId])

  const currentMember = useMemo(
    () => members.find((member) => member.userId === currentUserId),
    [members, currentUserId],
  )

  const currentUserRelation = useMemo(() => {
    if (isAdmin) return "self"
    return normalizeRelation(currentMember?.relation)
  }, [currentMember?.relation, isAdmin])

  useEffect(() => {
    setVitalsPage(1)
    setMedicalRecordsPage(1)
  }, [selectedMember?.userId])

  useEffect(() => {
    const canView = selectedMember?.userId && selectedMember.userId === currentUserId
    if (!canView) {
      setMedicalRecords([])
      setMedicalRecordsTotalPages(1)
      setRecordsLoading(false)
      return
    }
    setRecordsLoading(true)
    const loadRecords = async () => {
      try {
        const result = await getMedicalRecords({
          page: medicalRecordsPage,
          limit: 4,
        })
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
  }, [selectedMember?.userId, currentUserId, medicalRecordsPage])

  useEffect(() => {
    const canView = selectedMember?.userId && selectedMember.userId === currentUserId
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
  }, [selectedMember?.userId, currentUserId])

  const currentUserVitals = useMemo(
    () => userData?.vitals ?? userData?.latestVitals ?? null,
    [userData],
  )

  const resolveMemberVitals = (member?: any) => {
    if (!member) return null
    const base = member.latestVitals ?? member.recentVitals?.[0] ?? null
    if (member.userId && member.userId === currentUserId) {
      return mergeVitals(base, currentUserVitals)
    }
    return base
  }

  const canViewMemberDetails =
    Boolean(selectedMember?.userId && selectedMember.userId === currentUserId)

  const familyTitle = useMemo(() => {
    const currentMember = members.find((member) => member.userId === currentUserId)
    const lastName = getLastName(currentMember?.name)
    const fallback = lastName ? `${lastName} Family` : "Family Health"
    if (groupName && groupName !== "Family Health") return groupName
    return fallback
  }, [members, currentUserId, groupName])

  const summary = useMemo(() => {
    const total = members.length
    const stable = members.filter((member) => member.status === "stable").length
    const warning = members.filter((member) => member.status === "warning").length
    const critical = members.filter((member) => member.status === "critical").length
    const avgScore = total
      ? Math.round(
        members.reduce(
          (sum, member) => sum + (member.healthScore ?? 0),
          0
        ) / total
      )
      : 0
    return { total, stable, warning, critical, avgScore }
  }, [members])

  const vitalsSummary = useMemo(() => {
    const heartRates = members
      .map((member) => resolveMemberVitals(member)?.heartRate)
      .filter((value) => typeof value === "number") as number[]
    const avgHeartRate = heartRates.length
      ? Math.round(heartRates.reduce((sum, value) => sum + value, 0) / heartRates.length)
      : 0
    return { avgHeartRate }
  }, [members, currentUserId, currentUserVitals])

  const chartData = useMemo(
    () =>
      members.map((member) => ({
        name: formatName(member.name),
        score: member.healthScore ?? 0,
      })),
    [members]
  )

  const vitalsChartData = useMemo(
    () =>
      members.map((member) => ({
        name: formatName(member.name),
        heartRate: resolveMemberVitals(member)?.heartRate ?? 0,
      })),
    [members, currentUserId, currentUserVitals],
  )

  const aiInsights = useMemo(() => {
    if (!members.length) return []
    const alerts = members.filter((member) => member.status === "critical")
    const missingVitals = members.filter(
      (member) => !member.latestVitals && !member.recentVitals?.length
    )
    const insights = [] as { title: string; detail: string }[]

    if (alerts.length) {
      insights.push({
        title: "Critical attention",
        detail: `${alerts.length} member(s) need immediate review.`,
      })
    }

    if (missingVitals.length) {
      insights.push({
        title: "Missing vitals",
        detail: `${missingVitals.length} member(s) have no recent vitals on file.`,
      })
    }

    insights.push({
      title: "Family stability",
      detail: `Average health score is ${summary.avgScore}.`,
    })

    return insights.slice(0, 3)
  }, [members, summary.avgScore])

  const vitalsHistory = useMemo(() => {
    const items = selectedMember?.recentVitals ?? []
    return [...items].sort((a, b) => {
      const aDate = new Date(a.recordedAt ?? a.createdAt ?? 0).getTime()
      const bDate = new Date(b.recordedAt ?? b.createdAt ?? 0).getTime()
      return bDate - aDate
    })
  }, [selectedMember])

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

  const hasCritical = summary.critical > 0


  const handleCreateGroup = () => {
    const name = createGroupName.trim()
    if (!name) {
      toast.error("Enter a group name")
      return
    }
    startCreateTransition(async () => {
      const result = await createFamilyGroup({ name })
      if (!result.success || !result.data) {
        toast.error(result.message || "Unable to create family group")
        return
      }
      setGroupId(result.data._id)
      setGroupName(result.data.name)
      setCreateGroupName(result.data.name)
      setCreateGroupOpen(false)
      toast.success("Family group created")
      await loadSummary()
    })
  }

  const handleGenerateInvite = () => {
    if (!groupId) {
      toast.error("Create a family group first")
      return
    }
    startInviteTransition(async () => {
      const result = await createFamilyInvite(groupId, { expiresInDays: 7 })
      if (!result.success || !result.data) {
        toast.error(result.message || "Unable to generate invite link")
        return
      }
      setInviteLink(result.data.inviteLink)
      setInviteExpiresAt(result.data.expiresAt ?? null)
      toast.success("Invite link generated")
    })
  }

  const handleCopyInvite = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success("Invite link copied")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  const handleJoinGroup = () => {
    const token = extractInviteToken(joinInviteInput)
    if (!token) {
      toast.error("Enter a valid invite link or token")
      return
    }
    startJoinTransition(async () => {
      const payload = joinRelationInput.trim()
        ? { relation: joinRelationInput.trim() }
        : undefined
      const result = await joinFamilyInvite(token, payload)
      if (!result.success || !result.data) {
        toast.error(result.message || "Unable to join family group")
        return
      }
      toast.success("Joined family group")
      setJoinInviteInput("")
      setJoinRelationInput("")
      setJoinGroupOpen(false)
      await loadSummary()
    })
  }

  const handleAddMember = () => {
    if (!groupId) {
      toast.error("Create a family group first")
      return
    }
    if (!userIdInput.trim()) {
      toast.error("Enter a user ID")
      return
    }
    startMemberTransition(async () => {
      const result = await addFamilyMemberById(groupId, {
        userId: userIdInput.trim(),
        relation: relationInput.trim() || undefined,
      })
      if (!result.success) {
        toast.error(result.message || "Unable to add member")
        return
      }
      toast.success("Member added")
      setUserIdInput("")
      setRelationInput("")
      setAddMemberOpen(false)
      await loadSummary()
    })
  }

  const handleStartEditRelation = (member: any) => {
    if (!isAdmin) return
    setEditingMemberId(member.userId)
    setRelationDraft(member.relation || "")
  }

  const handleCancelEditRelation = () => {
    setEditingMemberId(null)
    setRelationDraft("")
  }

  const handleSaveRelation = (memberId: string) => {
    if (!groupId) return
    startRelationTransition(async () => {
      const result = await updateFamilyMemberRelation(groupId, memberId, {
        relation: relationDraft.trim() || undefined,
      })
      if (!result.success) {
        toast.error(result.message || "Unable to update relation")
        return
      }
      toast.success("Relation updated")
      handleCancelEditRelation()
      await loadSummary()
    })
  }

  const getRelationLabel = (member: any) => {
    if (!member) return "Member"
    if (member.userId && member.userId === currentUserId) return "Self"
    const relation = normalizeRelation(member.relation)
    if (!relation) return "Member"
    if (isAdmin) return formatStoredRelation(relation)
    const relative = getRelativeRelationLabel(currentUserRelation, relation, member.gender)
    if (relative) return relative
    if (relation === "self") return "Admin"
    return formatStoredRelation(relation)
  }

  const renderVitalsSummary = (member?: any) => {
    const vitals = resolveMemberVitals(member)
    const bp = vitals?.systolicBp && vitals?.diastolicBp
      ? `${vitals.systolicBp}/${vitals.diastolicBp}`
      : "--"
    const heartRate = formatValue(vitals?.heartRate)
    const glucose = formatValue(vitals?.glucoseLevel)
    const bmi = formatValue(vitals?.bmi)

    return (
      <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 px-3 py-3">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Last recorded vitals
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-700">
          BP {bp} | HR {heartRate} | Glucose {glucose}
        </p>
        <p className="text-xs text-slate-400">BMI {bmi}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <section className="space-y-4">
            <Card className="overflow-hidden rounded-3xl border border-primary/20 bg-primary text-white shadow-sm">
              <CardContent className="p-0">
                <div className="grid gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="space-y-2">

                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold sm:text-3xl">
                        {familyTitle}
                      </h1>
                      <Badge className="bg-white/15 text-white">
                        {isAdmin ? "Family Admin" : "Family Member"}
                      </Badge>
                    </div>
                    <p className="max-w-2xl text-sm text-white/80">
                      Monitor family vitals, health trends, and AI-guided insights in one place.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    {showAdminActions ? (
                      <>
                        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                          <DialogTrigger asChild>
                            <Button
                              className="h-10 rounded-full bg-white text-primary shadow-sm hover:bg-white/90"
                            >
                              <Plus className="h-4 w-4" />
                              Add member
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl border-slate-200/80 bg-white sm:max-w-lg">
                            <DialogHeader className="text-left">
                              <DialogTitle className="text-lg font-semibold text-slate-900">Add member</DialogTitle>
                              <DialogDescription className="text-sm text-slate-500">
                                Add an existing user by their ID and assign a relation.
                              </DialogDescription>
                            </DialogHeader>
                            {!groupId ? (
                              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                <p className="font-semibold text-slate-900">Create a family group to continue.</p>
                                <p className="text-xs text-slate-500">
                                  You need an active family group before adding members.
                                </p>
                                <Button
                                  className="mt-3 w-full rounded-full"
                                  onClick={handleCreateGroup}
                                  disabled={createPending}
                                >
                                  Create family group
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Input
                                  value={userIdInput}
                                  onChange={(event) => setUserIdInput(event.target.value)}
                                  placeholder="User ID"
                                  className="text-sm"
                                />
                                <Input
                                  value={relationInput}
                                  onChange={(event) => setRelationInput(event.target.value)}
                                  placeholder="Relation (optional)"
                                  className="text-sm"
                                />
                                <DialogFooter>
                                  <Button
                                    className="w-full rounded-full"
                                    onClick={handleAddMember}
                                    disabled={memberPending}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                    Add member
                                  </Button>
                                </DialogFooter>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog open={inviteMemberOpen} onOpenChange={setInviteMemberOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-10 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            >
                              <Mail className="h-4 w-4" />
                              Invite member
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl border-slate-200/80 bg-white sm:max-w-lg">
                            <DialogHeader className="text-left">
                              <DialogTitle className="text-lg font-semibold text-slate-900">Invite member</DialogTitle>
                              <DialogDescription className="text-sm text-slate-500">
                                Generate a secure invite link to share with a family member.
                              </DialogDescription>
                            </DialogHeader>
                            {!groupId ? (
                              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                <p className="font-semibold text-slate-900">Create a family group to continue.</p>
                                <p className="text-xs text-slate-500">
                                  You need an active family group before sending invites.
                                </p>
                                <Button
                                  className="mt-3 w-full rounded-full"
                                  onClick={handleCreateGroup}
                                  disabled={createPending}
                                >
                                  Create family group
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Button
                                  variant="outline"
                                  className="w-full rounded-full border-slate-200"
                                  onClick={handleGenerateInvite}
                                  disabled={invitePending}
                                >
                                  <LinkIcon className="h-4 w-4" />
                                  Generate invite link
                                </Button>
                                {inviteLink ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Input value={inviteLink} readOnly className="text-xs" />
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9"
                                        onClick={handleCopyInvite}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                      {inviteExpiresAt
                                        ? `Expires on ${formatDate(inviteExpiresAt)}`
                                        : "Invite link active for 7 days"}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500">
                                    Invite links expire in 7 days by default.
                                  </p>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : null}

                    {showGroupActions ? (
                      <>
                        <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
                          <DialogTrigger asChild>
                            <Button
                              className="h-10 rounded-full bg-white text-primary shadow-sm hover:bg-white/90"
                            >
                              <Plus className="h-4 w-4" />
                              Create group
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl border-slate-200/80 bg-white sm:max-w-lg">
                            <DialogHeader className="text-left">
                              <DialogTitle className="text-lg font-semibold text-slate-900">Create family group</DialogTitle>
                              <DialogDescription className="text-sm text-slate-500">
                                Choose a name for your family group.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <Input
                                value={createGroupName}
                                onChange={(event) => setCreateGroupName(event.target.value)}
                                placeholder="Group name"
                                className="text-sm"
                              />
                              <DialogFooter>
                                <Button
                                  className="w-full rounded-full"
                                  onClick={handleCreateGroup}
                                  disabled={createPending}
                                >
                                  Create group
                                </Button>
                              </DialogFooter>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-10 rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            >
                              <LinkIcon className="h-4 w-4" />
                              Join group
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl border-slate-200/80 bg-white sm:max-w-lg">
                            <DialogHeader className="text-left">
                              <DialogTitle className="text-lg font-semibold text-slate-900">Join family group</DialogTitle>
                              <DialogDescription className="text-sm text-slate-500">
                                Paste an invite link or token to join a family group.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <Input
                                value={joinInviteInput}
                                onChange={(event) => setJoinInviteInput(event.target.value)}
                                placeholder="Invite link or token"
                                className="text-sm"
                              />
                              <Input
                                value={joinRelationInput}
                                onChange={(event) => setJoinRelationInput(event.target.value)}
                                placeholder="Relation (optional)"
                                className="text-sm"
                              />
                              <DialogFooter>
                                <Button
                                  className="w-full rounded-full"
                                  onClick={handleJoinGroup}
                                  disabled={joinPending}
                                >
                                  Join group
                                </Button>
                              </DialogFooter>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : null}

                    <Button
                      className={`h-10 rounded-full ${hasCritical
                        ? "bg-rose-600 text-white hover:bg-rose-500"
                        : "bg-white/15 text-white hover:bg-white/25"
                        }`}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Emergency alert
                    </Button>
                  </div>
                </div>

                <div className="border-t border-white/15 px-6 pb-6 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-white/70">Total members</p>
                      <p className="mt-1 text-lg font-semibold">{summary.total}</p>
                      <p className="text-xs text-white/70">Active in group</p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-white/70">Stable</p>
                      <p className="mt-1 text-lg font-semibold">{summary.stable}</p>
                      <p className="text-xs text-white/70">On track</p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-white/70">Watch</p>
                      <p className="mt-1 text-lg font-semibold">{summary.warning}</p>
                      <p className="text-xs text-white/70">Needs attention</p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3">
                      <p className="text-xs uppercase tracking-wider text-white/70">Family score</p>
                      <p className="mt-1 text-lg font-semibold">{summary.avgScore}</p>
                      <p className="text-xs text-white/70">Average index</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Family members</h2>
              <p className="text-sm text-slate-500">
                Select a member to review vitals and care guidance.
              </p>
            </div>

            {loading ? (
              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardContent className="py-10 text-center text-sm text-slate-500">
                  Loading family profiles...
                </CardContent>
              </Card>
            ) : members.length === 0 ? (
              <Card className="rounded-3xl border-dashed border-slate-200 bg-white">
                <CardContent className="py-10 text-center text-sm text-slate-500">
                  No family members found yet.
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto overflow-y-visible px-1 pb-3 pt-1 scrollbar-light">
                <div className="grid grid-flow-col gap-4 auto-cols-[minmax(260px,1fr)] lg:auto-cols-[calc((100%-2rem)/3)]">
                  {members.map((member) => {
                    const meta = statusMeta[member.status || "warning"]
                    const isSelected = selectedMember?.userId === member.userId
                    const isEditing = editingMemberId === member.userId
                    const isSelf = member.userId === currentUserId
                    return (
                      <Card
                        key={member.userId}
                        onClick={() => router.push(`/family-health/members/${member.userId}`)}
                        className={`flex-none cursor-pointer rounded-3xl ${isSelf ? "border-slate-200/50" : "border-slate-200/80"} bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isSelected ? "ring-1 ring-blue-200/80" : ""
                          }`}
                      >
                        <CardContent className="space-y-3 px-4 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                                {getInitials(formatName(member.name))}
                              </div>
                              <div>
                                <p className="text-base font-semibold text-slate-900">
                                  {formatName(member.name)}
                                </p>
                                {isEditing ? (
                                  <div
                                    className="mt-2 flex items-center gap-2"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <Input
                                      value={relationDraft}
                                      onChange={(event) => setRelationDraft(event.target.value)}
                                      placeholder="Relation"
                                      className="h-9 text-xs"
                                    />
                                    <Button
                                      size="icon"
                                      className="h-9 w-9"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        handleSaveRelation(member.userId)
                                      }}
                                      disabled={relationPending}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-9 w-9"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        handleCancelEditRelation()
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span>{getRelationLabel(member)}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span>{member.age ?? "--"} yrs</span>
                                    {isAdmin ? (
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          handleStartEditRelation(member)
                                        }}
                                      >
                                        <PencilLine className="h-3 w-3" />
                                        Edit
                                      </button>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={meta.badge}>{meta.label}</Badge>
                            </div>
                          </div>
                          {renderVitalsSummary(member)}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          {selectedMember ? (
            <section className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-base font-semibold text-slate-700">
                        {getInitials(formatName(selectedMember.name))}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                          {formatName(selectedMember.name)}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500">
                          {getRelationLabel(selectedMember)} | {selectedMember.age ?? "--"} yrs | Last update {formatDate(selectedMember.lastUpdated)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      {isAdmin ? (
                        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                          <SelectTrigger className="h-9 rounded-xl border-slate-200/70 bg-white text-xs font-semibold text-slate-700">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent align="end">
                            {members.map((member) => (
                              <SelectItem key={member.userId} value={member.userId}>
                                {formatName(member.name)} ({getRelationLabel(member)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                      <Badge className={statusMeta[selectedMember.status || "warning"].badge}>
                        {statusMeta[selectedMember.status || "warning"].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="vitals">Vitals History</TabsTrigger>
                      <TabsTrigger value="records">Medical Records</TabsTrigger>
                      <TabsTrigger value="allergies">Allergies</TabsTrigger>
                      <TabsTrigger value="medications">Medications</TabsTrigger>
                      <TabsTrigger value="ai">AI Consultations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-wider text-slate-500">Latest vitals</p>
                          <div className="mt-2 space-y-1 text-sm text-slate-600">
                            {(() => {
                              const vitals = resolveMemberVitals(selectedMember)
                              const bp = vitals?.systolicBp && vitals?.diastolicBp
                                ? `${vitals.systolicBp}/${vitals.diastolicBp}`
                                : "--"
                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span>Blood pressure</span>
                                    <span className="font-semibold text-slate-900">{bp}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Heart rate</span>
                                    <span className="font-semibold text-slate-900">
                                      {formatValue(vitals?.heartRate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>Glucose</span>
                                    <span className="font-semibold text-slate-900">
                                      {formatValue(vitals?.glucoseLevel)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>BMI</span>
                                    <span className="font-semibold text-slate-900">
                                      {formatValue(vitals?.bmi)}
                                    </span>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-wider text-slate-500">Profile info</p>
                          <div className="mt-2 space-y-1 text-sm text-slate-600">
                            <div className="flex items-center justify-between">
                              <span>Age</span>
                              <span className="font-semibold text-slate-900">
                                {selectedMember.age ?? "--"} yrs
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Gender</span>
                              <span className="font-semibold text-slate-900">
                                {selectedMember.gender ?? "--"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Health score</span>
                              <span className="font-semibold text-slate-900">
                                {selectedMember.healthScore ?? "--"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-wider text-slate-500">Active alerts</p>
                          <div className="mt-2 space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
                              <AlertTriangle className="h-4 w-4" />
                              {selectedMember.status === "critical"
                                ? "Immediate follow-up recommended."
                                : selectedMember.status === "warning"
                                  ? "Monitor vitals in the next 24 hours."
                                  : "Vitals remain stable over the last check-in."}
                            </div>
                            <p className="text-xs text-slate-500">
                              Alerts update after each vitals upload.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="vitals" className="space-y-4">
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
                                  {pagedVitals.map((entry: any, index: number) => {
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
                            {pagedVitals.map((entry: any, index: number) => {
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
                <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-slate-900">AI insights</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Real-time family signals and priorities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiInsights.map((insight) => (
                      <div key={insight.title} className="rounded-2xl bg-blue-50/70 px-3 py-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                            <p className="text-xs text-slate-500">{insight.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

              </aside>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-900">Vaidya score</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Health score across all members from latest vitals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChartContainer
                  className="h-56 w-full"
                  config={{ score: { label: "Health score", color: PRIMARY } }}
                >
                  <BarChart data={chartData} margin={{ left: -10, right: 12, top: 12, bottom: 0 }}>
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
                    <Bar dataKey="score" fill={PRIMARY} radius={[10, 10, 10, 10]} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>

                <div className="grid gap-3 sm:grid-cols-3">
                  {members.map((member) => (
                    <div key={member.userId} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2">
                      <p className="text-xs uppercase tracking-wider text-slate-500">{getRelationLabel(member)}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {member.healthScore ?? "--"}
                      </p>
                      <p className="text-xs text-slate-500">Health score</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-900">Heart rate snapshot</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Latest heart rate recorded per member.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChartContainer
                  className="h-56 w-full"
                  config={{ heartRate: { label: "Heart rate", color: SECONDARY } }}
                >
                  <LineChart data={vitalsChartData} margin={{ left: -10, right: 12, top: 12, bottom: 0 }}>
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
                      dataKey="heartRate"
                      stroke={SECONDARY}
                      strokeWidth={2}
                      dot={{ r: 4, fill: SECONDARY }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Average heart rate</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {vitalsSummary.avgHeartRate ? `${vitalsSummary.avgHeartRate} bpm` : "--"}
                  </p>
                  <p className="text-xs text-slate-500">Based on latest vitals entries.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
