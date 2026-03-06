"use client"

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react"
import {
  CloudUpload,
  FilePlus2,
  FolderHeart,
  Image as ImageIcon,
  ImagePlus,
  MoreHorizontal,
  FileText,
  Download,
  Search,
  Sparkles,
  Eye,
  Pencil,
  Trash2,
  FolderOpen,
  Plus,
  FileImage,
} from "lucide-react"

import {
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "@/lib/actions/medical-record-action"
import { scanMedicalImage } from "@/lib/actions/ai-action"
import { type TMedicalRecord } from "@/lib/definition"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { StatGrid } from "@/components/ui/stat-grid"
import {
  defaultVisitTypes,
  statusOptions,
  dateOptions,
  sortOptions,
  recordTypes,
  extraCategoryOptions,
  typeFieldMap,
  insightBadgeClasses,
} from "../_lib/options"
import {
  normalizeCategoryLabel,
  parseDate,
  todayISO,
  formatDate,
  parseNumberField,
  parseSymptomList,
  formatStructuredValue,
  formatFileSize,
  isPdfAttachment,
  isImageAttachment,
  buildCloudinaryPdfPreviewUrl,
  buildFileProxyUrl,
  downloadUrl,
} from "../_lib/utils"
import { useInsights } from "../_hooks/use-insights"
import { useRecords } from "../_hooks/use-records"

export default function Records() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [providerFilter, setProviderFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("Any time")
  const [sortBy, setSortBy] = useState("Last updated")
  const limit = 100
  const {
    page,
    setPage,
    records,
    pagination,
    loading: loadingRecords,
    refresh: fetchRecords,
  } = useRecords(limit)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [manualDialogOpen, setManualDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [activeRecord, setActiveRecord] = useState<TMedicalRecord | null>(null)
  const [folderSheetOpen, setFolderSheetOpen] = useState(false)
  const [aiAttachments, setAiAttachments] = useState<File[]>([])
  const [manualAttachments, setManualAttachments] = useState<File[]>([])
  const [editAttachments, setEditAttachments] = useState<File[]>([])
  const [aiRecordType, setAiRecordType] = useState("Visit")
  const [manualRecordType, setManualRecordType] = useState("Visit")
  const [aiStructured, setAiStructured] = useState<Record<string, string>>({})
  const [manualStructured, setManualStructured] = useState<Record<string, string>>({})
  const [aiCustomFields, setAiCustomFields] = useState<
    { key: string; value: string }[]
  >([])
  const [manualCustomFields, setManualCustomFields] = useState<
    { key: string; value: string }[]
  >([])
  const [aiDraft, setAiDraft] = useState({
    title: "",
    category: "",
    provider: "",
    date: todayISO(),
    visitType: "Routine",
    diagnosis: "",
    content: "",
    notes: "",
  })
  const [manualDraft, setManualDraft] = useState({
    title: "",
    category: "",
    provider: "",
    date: todayISO(),
    visitType: "Routine",
    diagnosis: "",
    content: "",
    notes: "",
  })
  const [editDraft, setEditDraft] = useState({
    title: "",
    category: "",
    provider: "",
    date: todayISO(),
    visitType: "Routine",
    diagnosis: "",
    content: "",
    notes: "",
  })
  const [editRecordType, setEditRecordType] = useState("Visit")
  const [editStructured, setEditStructured] = useState<Record<string, string>>({})
  const [editCustomFields, setEditCustomFields] = useState<
    { key: string; value: string }[]
  >([])
  const scanFileInputRef = useRef<HTMLInputElement | null>(null)
  const aiAttachmentsRef = useRef<HTMLInputElement | null>(null)
  const manualAttachmentsRef = useRef<HTMLInputElement | null>(null)
  const editAttachmentsRef = useRef<HTMLInputElement | null>(null)
  const {
    aiInsights,
    aiInsightsLoading,
    aiInsightsError,
    insightsUpdatedAt,
    refreshAiInsights,
    formatUpdatedAt,
  } = useInsights(records, !loadingRecords)

  const splitStructuredData = (
    recordType: string,
    data?: Record<string, unknown>
  ) => {
    const fields = typeFieldMap[recordType] ?? []
    const fieldKeys = new Set(fields.map((field) => field.key))
    const structured: Record<string, string> = {}
    const custom: { key: string; value: string }[] = []

    Object.entries(data ?? {}).forEach(([key, value]) => {
      const formatted = formatStructuredValue(value)
      if (fieldKeys.has(key)) {
        structured[key] = formatted
      } else if (formatted.trim().length) {
        custom.push({ key, value: formatted })
      }
    })

    return { structured, custom }
  }

  const normalizeRecordTypeLabel = (value?: string) => {
    if (!value) return undefined
    const match = recordTypes.find(
      (item) => item.toLowerCase() === value.toLowerCase()
    )
    return match ?? value
  }

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFileUrl(null)
      return
    }

    if (!selectedFile.type.startsWith("image/")) {
      setSelectedFileUrl(null)
      return
    }


    const url = URL.createObjectURL(selectedFile)
    setSelectedFileUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  const categoryOptions = useMemo(() => {
    const ordered: string[] = []
    const seen = new Set<string>()
    const add = (value?: string) => {
      const normalized = normalizeCategoryLabel(value)
      if (!normalized) return
      const key = normalized.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      ordered.push(normalized)
    }

    recordTypes.forEach((type) => add(type))
    extraCategoryOptions.forEach((category) => add(category))
    records.forEach((record) => add(record.category || record.recordType))
    if (records.some((record) => !record.category && !record.recordType)) {
      add("Other")
    }

    return ["All", ...ordered]
  }, [records])

  const providerOptions = useMemo(() => {
    const providers = new Set<string>()
    records.forEach((record) => {
      const provider = record.provider?.trim()
      if (provider) providers.add(provider)
    })
    if (records.some((record) => !record.provider)) {
      providers.add("Unspecified")
    }
    return ["All", ...Array.from(providers).sort()]
  }, [records])

  const folderRows = useMemo(() => {
    const groups = new Map<string, { count: number; updatedAt?: string }>()
    records.forEach((record) => {
      const label =
        normalizeCategoryLabel(record.category || record.recordType) ?? "Other"
      const date = record.recordDate || record.updatedAt || record.createdAt
      const entry = groups.get(label) ?? { count: 0 }
      entry.count += 1
      const existingDate = parseDate(entry.updatedAt)
      const nextDate = parseDate(date)
      if (nextDate && (!existingDate || nextDate > existingDate)) {
        entry.updatedAt = nextDate.toISOString()
      }
      groups.set(label, entry)
    })

    return Array.from(groups.entries())
      .map(([name, info]) => ({
        name,
        count: info.count,
        updated: info.updatedAt ? formatDate(info.updatedAt) : "N/A",
      }))
      .sort((a, b) => {
        const dateA = parseDate(a.updated)?.getTime() ?? 0
        const dateB = parseDate(b.updated)?.getTime() ?? 0
        return dateB - dateA
      })
  }, [records])

  const overviewStats = useMemo(() => {
    const now = new Date()
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const newUploads = records.filter((record) => {
      const date = record.recordDate || record.createdAt
      if (!date) return false
      return new Date(date) >= fourteenDaysAgo
    }).length
    const aiProcessed = records.filter((record) => record.aiScanned).length
    const providers = new Set(
      records
        .map((record) => record.provider?.trim())
        .filter((provider) => provider)
    ).size

    return [
      {
        label: "Total records",
        value: String(records.length),
        detail: "All time",
      },
      {
        label: "New uploads",
        value: String(newUploads),
        detail: "Last 14 days",
      },
      {
        label: "AI processed",
        value: String(aiProcessed),
        detail: "Ready to review",
      },
      {
        label: "Providers",
        value: String(providers),
        detail: "Connected sources",
      },
    ]
  }, [records])

  const documents = useMemo(() => {
    return records.map((record) => {
      const rawDate = record.recordDate || record.updatedAt || record.createdAt
      return {
        id: record._id,
        name: record.title || "Untitled record",
        type:
          normalizeCategoryLabel(record.category || record.recordType) ??
          "Other",
        provider: record.provider?.trim() || "Unspecified",
        dateLabel: formatDate(rawDate),
        rawDate,
        status: record.status || "Processed",
      }
    })
  }, [records])

  const findRecordById = useCallback(
    (id: string) => records.find((record) => record._id === id),
    [records]
  )

  const aiProcessedCount = useMemo(() => {
    if (!records.length) return 0
    return records.filter((record) => record.aiScanned).length
  }, [records])

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const now = new Date()

    const filtered = documents.filter((doc) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        doc.name.toLowerCase().includes(normalizedSearch) ||
        doc.provider.toLowerCase().includes(normalizedSearch) ||
        doc.type.toLowerCase().includes(normalizedSearch)

      const matchesCategory =
        activeCategory === "All" ||
        doc.type.toLowerCase() === activeCategory.toLowerCase()

      const matchesStatus =
        statusFilter === "All" || doc.status === statusFilter

      const matchesProvider =
        providerFilter === "All" || doc.provider === providerFilter

      const docDate = parseDate(doc.rawDate)
      const matchesDate = (() => {
        if (!docDate || dateFilter === "Any time") return true
        if (dateFilter === "Last 30 days") {
          return docDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        if (dateFilter === "Last 90 days") {
          return docDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        }
        if (dateFilter === "2026") return docDate.getFullYear() === 2026
        if (dateFilter === "2025") return docDate.getFullYear() === 2025
        return true
      })()

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesProvider &&
        matchesDate
      )
    })
    const sorted = [...filtered]
    if (sortBy === "Name A-Z") {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    if (sortBy === "Name Z-A") {
      sorted.sort((a, b) => b.name.localeCompare(a.name))
    }
    if (sortBy === "Last updated") {
      sorted.sort((a, b) => {
        const dateA = parseDate(a.rawDate)?.getTime() ?? 0
        const dateB = parseDate(b.rawDate)?.getTime() ?? 0
        return dateB - dateA
      })
    }
    return sorted
  }, [
    documents,
    searchTerm,
    activeCategory,
    statusFilter,
    providerFilter,
    dateFilter,
    sortBy,
  ])

  const pageStart = filteredDocuments.length ? (page - 1) * limit + 1 : 0
  const pageEnd = filteredDocuments.length
    ? (page - 1) * limit + filteredDocuments.length
    : 0

  useEffect(() => {
    setPage(1)
  }, [searchTerm, activeCategory, statusFilter, providerFilter, dateFilter, sortBy])


  const handleScanFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null
    if (!file) return

    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const inferredRecordType = file.type.startsWith("image/") ? "Imaging" : "Lab"
    const fileCategory = inferredRecordType

    setSelectedFile(file)
    setAiAttachments([])
    setAiStructured({})
    setAiCustomFields([])
    setAiRecordType(inferredRecordType)
    setAiDraft({
      title: baseName || "Untitled record",
      category: fileCategory,
      provider: "",
      date: todayISO(),
      visitType: "Routine",
      diagnosis: "",
      content: "",
      notes: "",
    })
    setScanDialogOpen(true)
    setScanLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    const scanResult = await scanMedicalImage(formData)
    setScanLoading(false)

    if (scanResult.success && scanResult.data) {
      const scanData = scanResult.data
      const recordType = normalizeRecordTypeLabel(scanData.recordType)
      const normalizedCategory = normalizeCategoryLabel(recordType)
      const structured =
        scanData.structured && typeof scanData.structured === "object"
          ? scanData.structured
          : {}
      const mappedStructured: Record<string, string> = {}
      Object.entries(structured).forEach(([key, value]) => {
        const formatted = formatStructuredValue(value)
        if (formatted.trim().length) mappedStructured[key] = formatted
      })

      if (recordType && recordTypes.includes(recordType)) {
        setAiRecordType(recordType)
      }

      setAiStructured(mappedStructured)
      setAiDraft((prev) => ({
        ...prev,
        title: scanData.text && !baseName ? "Scanned record" : prev.title,
        category: normalizedCategory ?? prev.category,
        provider: scanData.provider ?? prev.provider,
        date: scanData.recordDate ?? prev.date,
        content: scanData.summary ?? scanData.text ?? prev.content,
      }))
    } else {
      toast.error(scanResult.message || "Failed to scan image")
    }
  }

  const handleScanClick = () => {
    scanFileInputRef.current?.click()
  }

  const handleAiAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setAiAttachments(files)
  }

  const handleManualAttachmentsChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? [])
    setManualAttachments(files)
  }

  const handleEditAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setEditAttachments(files)
  }

  const removeEditAttachment = (index: number) => {
    setEditAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const buildDomainPayload = (
    recordType: string,
    structured: Record<string, string>,
    recordDate?: string
  ) => {
    const trimmedDate = recordDate?.trim()
    const hasAny = (obj: Record<string, unknown>) => Object.keys(obj).length > 0
    const setIf = (
      obj: Record<string, unknown>,
      key: string,
      value: unknown
    ) => {
      if (value === undefined || value === "") return
      obj[key] = value
    }

    const vitals: Record<string, unknown> = {}
    setIf(vitals, "systolicBp", parseNumberField(structured.systolicBp))
    setIf(vitals, "diastolicBp", parseNumberField(structured.diastolicBp))
    setIf(vitals, "heartRate", parseNumberField(structured.heartRate))
    setIf(vitals, "glucoseLevel", parseNumberField(structured.glucoseLevel))
    setIf(vitals, "weight", parseNumberField(structured.weight))
    setIf(vitals, "height", parseNumberField(structured.height))
    setIf(vitals, "bmi", parseNumberField(structured.bmi))
    if (trimmedDate && hasAny(vitals)) {
      setIf(vitals, "recordedAt", trimmedDate)
    }

    const labTests: Record<string, unknown> = {}
    setIf(labTests, "testName", structured.testName?.trim())
    setIf(labTests, "resultValue", structured.resultValue?.trim())
    setIf(labTests, "unit", structured.unit?.trim())
    setIf(labTests, "normalRange", structured.normalRange?.trim())
    setIf(labTests, "testedDate", structured.testedDate?.trim() || trimmedDate)

    const medications: Record<string, unknown> = {}
    setIf(medications, "medicineName", structured.medicineName?.trim())
    setIf(medications, "dosage", structured.dosage?.trim())
    setIf(medications, "frequency", structured.frequency?.trim())
    setIf(
      medications,
      "durationDays",
      parseNumberField(structured.durationDays)
    )
    setIf(
      medications,
      "startDate",
      structured.startDate?.trim() || (recordType === "Prescription" ? trimmedDate : undefined)
    )
    setIf(medications, "endDate", structured.endDate?.trim())
    setIf(medications, "purpose", structured.purpose?.trim())
    setIf(medications, "notes", structured.notes?.trim())
    setIf(medications, "diagnosis", structured.diagnosis?.trim())
    setIf(medications, "disease", structured.disease?.trim())

    const symptoms: Record<string, unknown> = {}
    setIf(symptoms, "symptomList", parseSymptomList(structured.symptomList))
    setIf(symptoms, "severity", structured.severity?.trim())
    setIf(
      symptoms,
      "durationDays",
      parseNumberField(structured.durationDays)
    )
    setIf(symptoms, "notes", structured.notes?.trim())
    setIf(symptoms, "diagnosis", structured.diagnosis?.trim())
    setIf(symptoms, "disease", structured.disease?.trim())
    if (trimmedDate && hasAny(symptoms)) {
      setIf(symptoms, "loggedAt", trimmedDate)
    }

    const allergies: Record<string, unknown> = {}
    setIf(allergies, "allergen", structured.allergen?.trim())
    setIf(allergies, "type", structured.type?.trim())
    setIf(allergies, "reaction", structured.reaction?.trim())
    setIf(allergies, "severity", structured.severity?.trim())
    setIf(allergies, "status", structured.status?.trim())
    setIf(allergies, "onsetDate", structured.onsetDate?.trim() || trimmedDate)
    setIf(
      allergies,
      "recordedAt",
      structured.recordedAt?.trim() || trimmedDate
    )
    setIf(allergies, "notes", structured.notes?.trim())

    const immunizations: Record<string, unknown> = {}
    setIf(immunizations, "vaccineName", structured.vaccineName?.trim())
    setIf(immunizations, "date", structured.date?.trim() || trimmedDate)
    setIf(
      immunizations,
      "doseNumber",
      parseNumberField(structured.doseNumber)
    )
    setIf(immunizations, "series", structured.series?.trim())
    setIf(immunizations, "manufacturer", structured.manufacturer?.trim())
    setIf(immunizations, "lotNumber", structured.lotNumber?.trim())
    setIf(immunizations, "site", structured.site?.trim())
    setIf(immunizations, "route", structured.route?.trim())
    setIf(immunizations, "provider", structured.provider?.trim())
    setIf(immunizations, "nextDue", structured.nextDue?.trim())
    setIf(immunizations, "notes", structured.notes?.trim())

    const payload: Record<string, unknown> = {}
    if (recordType === "Vitals" && hasAny(vitals)) payload.vitals = vitals
    if (recordType === "Lab" && hasAny(labTests)) payload.labTests = labTests
    if (recordType === "Prescription" && hasAny(medications)) {
      payload.medications = medications
    }
    if (
      (recordType === "Diagnosis" || recordType === "Visit") &&
      hasAny(symptoms)
    ) {
      payload.symptoms = symptoms
    }
    if (recordType === "Allergy" && hasAny(allergies)) {
      payload.allergies = allergies
    }
    if (recordType === "Immunization" && hasAny(immunizations)) {
      payload.immunizations = immunizations
    }
    return payload
  }

  const buildRecordFormData = (
    payload: typeof aiDraft | typeof manualDraft,
    files: File[],
    recordType: string,
    structured: Record<string, string>,
    customFields: { key: string; value: string }[],
    aiScanned: boolean
  ) => {
    const formData = new FormData()
    if (payload.title) formData.append("title", payload.title)
    if (recordType) formData.append("recordType", recordType)
    if (payload.category) {
      formData.append("category", payload.category)
    } else if (recordType) {
      formData.append("category", recordType)
    }
    if (payload.provider) formData.append("provider", payload.provider)
    if (payload.date) formData.append("recordDate", payload.date)
    if (payload.visitType) formData.append("visitType", payload.visitType)
    if (payload.diagnosis) formData.append("diagnosis", payload.diagnosis)
    if (payload.content) formData.append("content", payload.content)
    if (payload.notes) formData.append("notes", payload.notes)
    formData.append("aiScanned", aiScanned ? "true" : "false")

    const cleanedStructured: Record<string, string> = {}
    Object.entries(structured).forEach(([key, value]) => {
      if (value.trim().length) cleanedStructured[key] = value.trim()
    })
    const mergedStructured: Record<string, string> = { ...cleanedStructured }
    customFields.forEach((field) => {
      if (field.key.trim() && field.value.trim()) {
        mergedStructured[field.key.trim()] = field.value.trim()
      }
    })
    if (Object.keys(mergedStructured).length) {
      formData.append("structuredData", JSON.stringify(mergedStructured))
    }

    const domainPayload = buildDomainPayload(
      recordType,
      cleanedStructured,
      payload.date
    )
    Object.entries(domainPayload).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value))
    })

    files.forEach((file) => {
      formData.append("attachments", file)
    })

    return formData
  }

  const handleCreateFromScan = async () => {
    const files: File[] = []
    if (selectedFile) files.push(selectedFile)
    if (aiAttachments.length) files.push(...aiAttachments)

    const formData = buildRecordFormData(
      aiDraft,
      files,
      aiRecordType,
      aiStructured,
      aiCustomFields,
      true
    )
    const result = await createMedicalRecord(formData)
    if (result.success) {
      setScanDialogOpen(false)
      setSelectedFile(null)
      setAiAttachments([])
      setAiStructured({})
      setAiCustomFields([])
      if (aiAttachmentsRef.current) {
        aiAttachmentsRef.current.value = ""
      }
      await fetchRecords()
      toast.success(result.message || "Medical record created")
    } else {
      toast.error(result.message || "Failed to create medical record")
    }
  }

  const handleCreateManual = async () => {
    const formData = buildRecordFormData(
      manualDraft,
      manualAttachments,
      manualRecordType,
      manualStructured,
      manualCustomFields,
      false
    )
    const result = await createMedicalRecord(formData)
    if (result.success) {
      setManualDraft({
        title: "",
        category: "",
        provider: "",
        date: todayISO(),
        visitType: "Routine",
        diagnosis: "",
        content: "",
        notes: "",
      })
      setManualAttachments([])
      setManualStructured({})
      setManualCustomFields([])
      if (manualAttachmentsRef.current) {
        manualAttachmentsRef.current.value = ""
      }
      setManualDialogOpen(false)
      await fetchRecords()
      toast.success(result.message || "Medical record created")
    } else {
      toast.error(result.message || "Failed to create medical record")
    }
  }

  const openViewRecord = (record: TMedicalRecord) => {
    setActiveRecord(record)
    setViewDialogOpen(true)
  }

  const openEditRecord = (record: TMedicalRecord) => {
    const normalizedType = normalizeRecordTypeLabel(record.recordType) || "Visit"
    const recordType = recordTypes.includes(normalizedType)
      ? normalizedType
      : "Visit"
    const { structured, custom } = splitStructuredData(
      recordType,
      (record.structuredData as Record<string, unknown>) ?? {}
    )
    setActiveRecord(record)
    setEditRecordType(recordType)
    setEditStructured(structured)
    setEditCustomFields(custom)
    setEditAttachments([])
    if (editAttachmentsRef.current) {
      editAttachmentsRef.current.value = ""
    }
    setEditDraft({
      title: record.title ?? "",
      category:
        normalizeCategoryLabel(record.category || record.recordType) ??
        record.category ??
        "",
      provider: record.provider ?? "",
      date: record.recordDate ? record.recordDate.slice(0, 10) : todayISO(),
      visitType: record.visitType ?? "Routine",
      diagnosis: record.diagnosis ?? "",
      content: record.content ?? "",
      notes: record.notes ?? "",
    })
    setEditDialogOpen(true)
  }

  const handleUpdateRecord = async () => {
    if (!activeRecord) return
    const formData = buildRecordFormData(
      editDraft,
      editAttachments,
      editRecordType,
      editStructured,
      editCustomFields,
      activeRecord.aiScanned ?? false
    )
    const result = await updateMedicalRecord(activeRecord._id, formData)
    if (result.success) {
      setEditDialogOpen(false)
      setEditAttachments([])
      if (editAttachmentsRef.current) {
        editAttachmentsRef.current.value = ""
      }
      await fetchRecords()
      toast.success(result.message || "Medical record updated")
    } else {
      toast.error(result.message || "Failed to update medical record")
    }
  }

  const handleDeleteRecord = async (record: TMedicalRecord) => {
    const confirmed = window.confirm(
      `Delete "${record.title || "this record"}"? This action cannot be undone.`
    )
    if (!confirmed) return

    const result = await deleteMedicalRecord(record._id)
    if (result.success) {
      if (activeRecord?._id === record._id) {
        setViewDialogOpen(false)
        setEditDialogOpen(false)
      }
      await fetchRecords()
      toast.success(result.message || "Medical record deleted")
    } else {
      toast.error(result.message || "Failed to delete medical record")
    }
  }

  const openAttachmentByType = (
    record: TMedicalRecord,
    type: "pdf" | "image"
  ) => {
    const attachments = record.attachments ?? []
    const match = attachments.find((attachment) => {
      if (type === "pdf") {
        return isPdfAttachment(attachment)
      }
      return isImageAttachment(attachment)
    })

    if (!match?.url) {
      toast.error(type === "pdf" ? "No PDF attachment found" : "No image attachment found")
      return
    }
    if (type === "pdf") {
      const proxyUrl = buildFileProxyUrl(match.url, false, match.name)
      window.open(proxyUrl, "_blank", "noopener,noreferrer")
      return
    }
    window.open(match.url, "_blank", "noopener,noreferrer")
  }

  const updateStructuredField = (
    scope: "ai" | "manual" | "edit",
    key: string,
    value: string
  ) => {
    if (scope === "ai") {
      setAiStructured((prev) => ({ ...prev, [key]: value }))
      return
    }
    if (scope === "edit") {
      setEditStructured((prev) => ({ ...prev, [key]: value }))
      return
    }
    setManualStructured((prev) => ({ ...prev, [key]: value }))
  }

  const updateCustomField = (
    scope: "ai" | "manual" | "edit",
    index: number,
    key: "key" | "value",
    value: string
  ) => {
    if (scope === "ai") {
      setAiCustomFields((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [key]: value }
        return next
      })
      return
    }
    if (scope === "edit") {
      setEditCustomFields((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [key]: value }
        return next
      })
      return
    }
    setManualCustomFields((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  const addCustomField = (scope: "ai" | "manual" | "edit") => {
    if (scope === "ai") {
      setAiCustomFields((prev) => [...prev, { key: "", value: "" }])
      return
    }
    if (scope === "edit") {
      setEditCustomFields((prev) => [...prev, { key: "", value: "" }])
      return
    }
    setManualCustomFields((prev) => [...prev, { key: "", value: "" }])
  }

  const removeCustomField = (
    scope: "ai" | "manual" | "edit",
    index: number
  ) => {
    if (scope === "ai") {
      setAiCustomFields((prev) => prev.filter((_, i) => i !== index))
      return
    }
    if (scope === "edit") {
      setEditCustomFields((prev) => prev.filter((_, i) => i !== index))
      return
    }
    setManualCustomFields((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-linear-to-b from-primary/5 via-slate-50/50 to-white dark:from-background dark:via-background dark:to-background">
      <div className="border-b border-border bg-background/80 backdrop-blur">
        <div className="flex w-full flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">

              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Records center
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Store every document, scan with AI, and keep a clean timeline
                of your health history. Everything is searchable and shareable.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={scanFileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleScanFileChange}
              />
              <Button
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleScanClick}
              >
                <Sparkles className="h-4 w-4" />
                AI scan inbox
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                onClick={handleScanClick}
              >
                <ImagePlus className="h-4 w-4" />
                Scan document
              </Button>
              <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
                <DialogContent className="w-[min(96vw,920px)] sm:max-w-[920px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>AI scan results</DialogTitle>
                    <DialogDescription>
                      Review the auto-filled record form from your upload.
                    </DialogDescription>
                  </DialogHeader>
                  {scanLoading ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-500">
                      Scanning image... This may take a few seconds.
                    </div>
                  ) : null}
                  <div className="grid gap-4">
                    {selectedFile && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-background">
                            {selectedFileUrl ? (
                              <img
                                src={selectedFileUrl}
                                alt={selectedFile.name}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <FileImage className="h-5 w-5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(selectedFile.size / (1024 * 1024)).toFixed(1)}{" "}
                              MB
                            </p>
                          </div>
                          <Button variant="outline" size="xs" className="rounded-full" onClick={handleScanClick}>
                            Replace file
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-background p-4 sm:grid-cols-2">
                      <div className="grid gap-1 sm:col-span-2">
                        <Label htmlFor="scan-title">Title</Label>
                        <Input
                          id="scan-title"
                          value={aiDraft.title}
                          onChange={(event) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              title: event.target.value,
                            }))
                          }
                          placeholder="Record title"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="scan-date">Date</Label>
                        <Input
                          id="scan-date"
                          type="date"
                          value={aiDraft.date}
                          onChange={(event) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              date: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Category</Label>
                        <Select
                          value={aiDraft.category}
                          onValueChange={(value) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              category: value,
                            }))
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions
                              .filter((item) => item !== "All")
                              .map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1">
                        <Label>Record type</Label>
                        <Select
                          value={aiRecordType}
                          onValueChange={(value) => setAiRecordType(value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {recordTypes.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="scan-provider">Provider</Label>
                        <Input
                          id="scan-provider"
                          value={aiDraft.provider}
                          onChange={(event) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              provider: event.target.value,
                            }))
                          }
                          placeholder="Clinic or doctor"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Visit type</Label>
                        <Select
                          value={aiDraft.visitType}
                          onValueChange={(value) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              visitType: value,
                            }))
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select visit type" />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultVisitTypes.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="scan-diagnosis">Diagnosis</Label>
                        <Input
                          id="scan-diagnosis"
                          value={aiDraft.diagnosis}
                          onChange={(event) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              diagnosis: event.target.value,
                            }))
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div className="grid gap-1 sm:col-span-2">
                        <Label htmlFor="scan-content">Record content</Label>
                        <Textarea
                          id="scan-content"
                          value={aiDraft.content}
                          onChange={(event) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              content: event.target.value,
                            }))
                          }
                          placeholder="AI-extracted summary or key findings"
                        />
                      </div>
                      {typeFieldMap[aiRecordType]?.length ? (
                        <div className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:col-span-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Structured fields
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {typeFieldMap[aiRecordType].map((field) => (
                              <div className="grid gap-1" key={field.key}>
                                <Label htmlFor={`scan-structured-${field.key}`}>
                                  {field.label}
                                </Label>
                                <Input
                                  id={`scan-structured-${field.key}`}
                                  value={aiStructured[field.key] ?? ""}
                                  onChange={(event) =>
                                    updateStructuredField(
                                      "ai",
                                      field.key,
                                      event.target.value
                                    )
                                  }
                                  placeholder={field.placeholder}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:col-span-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Custom fields
                          </p>
                          <Button
                            variant="outline"
                            size="xs"
                            type="button"
                            onClick={() => addCustomField("ai")}
                          >
                            Add field
                          </Button>
                        </div>
                        <div className="grid gap-2">
                          {aiCustomFields.map((field, index) => (
                            <div
                              key={`ai-custom-${index}`}
                              className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                            >
                              <Input
                                placeholder="Key"
                                value={field.key}
                                onChange={(event) =>
                                  updateCustomField(
                                    "ai",
                                    index,
                                    "key",
                                    event.target.value
                                  )
                                }
                              />
                              <Input
                                placeholder="Value"
                                value={field.value}
                                onChange={(event) =>
                                  updateCustomField(
                                    "ai",
                                    index,
                                    "value",
                                    event.target.value
                                  )
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => removeCustomField("ai", index)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-1 sm:col-span-2">
                        <Label htmlFor="scan-notes">Notes</Label>
                        <Textarea
                          id="scan-notes"
                          value={aiDraft.notes}
                          onChange={(event) =>
                            setAiDraft((prev) => ({
                              ...prev,
                              notes: event.target.value,
                            }))
                          }
                          placeholder="Additional context or next steps"
                        />
                      </div>
                      <div className="grid gap-1 sm:col-span-2">
                        <Label htmlFor="scan-attachments">Attach files</Label>
                        <Input
                          id="scan-attachments"
                          type="file"
                          multiple
                          ref={aiAttachmentsRef}
                          onChange={handleAiAttachmentsChange}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 sm:col-span-2">
                        <Button variant="outline" size="sm">
                          Save draft
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCreateFromScan}
                          disabled={scanLoading}
                        >
                          Create record
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <FilePlus2 className="h-4 w-4" />
                    Add manual record
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[min(96vw,920px)] sm:max-w-[920px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add manual record</DialogTitle>
                    <DialogDescription>
                      Create a record even if you do not have a file yet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-2">
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="manual-title">Title</Label>
                      <Input
                        id="manual-title"
                        value={manualDraft.title}
                        onChange={(event) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Record title"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="manual-date">Date</Label>
                      <Input
                        id="manual-date"
                        type="date"
                        value={manualDraft.date}
                        onChange={(event) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            date: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Category</Label>
                      <Select
                        value={manualDraft.category}
                        onValueChange={(value) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions
                            .filter((item) => item !== "All")
                            .map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label>Record type</Label>
                      <Select
                        value={manualRecordType}
                        onValueChange={(value) => setManualRecordType(value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {recordTypes.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="manual-provider">Provider</Label>
                      <Input
                        id="manual-provider"
                        value={manualDraft.provider}
                        onChange={(event) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            provider: event.target.value,
                          }))
                        }
                        placeholder="Clinic or doctor"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Visit type</Label>
                      <Select
                        value={manualDraft.visitType}
                        onValueChange={(value) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            visitType: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultVisitTypes.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="manual-diagnosis">Diagnosis</Label>
                      <Input
                        id="manual-diagnosis"
                        value={manualDraft.diagnosis}
                        onChange={(event) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            diagnosis: event.target.value,
                          }))
                        }
                        placeholder="Optional"
                      />
                    </div>
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="manual-content">Record content</Label>
                      <Textarea
                        id="manual-content"
                        value={manualDraft.content}
                        onChange={(event) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            content: event.target.value,
                          }))
                        }
                        placeholder="Notes, summary, or key findings"
                      />
                    </div>
                    {typeFieldMap[manualRecordType]?.length ? (
                      <div className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Structured fields
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {typeFieldMap[manualRecordType].map((field) => (
                            <div className="grid gap-1" key={field.key}>
                              <Label htmlFor={`manual-structured-${field.key}`}>
                                {field.label}
                              </Label>
                              <Input
                                id={`manual-structured-${field.key}`}
                                value={manualStructured[field.key] ?? ""}
                                onChange={(event) =>
                                  updateStructuredField(
                                    "manual",
                                    field.key,
                                    event.target.value
                                  )
                                }
                                placeholder={field.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:col-span-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Custom fields
                        </p>
                        <Button
                          variant="outline"
                          size="xs"
                          type="button"
                          onClick={() => addCustomField("manual")}
                        >
                          Add field
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        {manualCustomFields.map((field, index) => (
                          <div
                            key={`manual-custom-${index}`}
                            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                          >
                            <Input
                              placeholder="Key"
                              value={field.key}
                              onChange={(event) =>
                                updateCustomField(
                                  "manual",
                                  index,
                                  "key",
                                  event.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Value"
                              value={field.value}
                              onChange={(event) =>
                                updateCustomField(
                                  "manual",
                                  index,
                                  "value",
                                  event.target.value
                                )
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => removeCustomField("manual", index)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="manual-notes">Notes</Label>
                      <Textarea
                        id="manual-notes"
                        value={manualDraft.notes}
                        onChange={(event) =>
                          setManualDraft((prev) => ({
                            ...prev,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Additional context or next steps"
                      />
                    </div>
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="manual-attachments">Attach files</Label>
                      <Input
                        id="manual-attachments"
                        type="file"
                        multiple
                        ref={manualAttachmentsRef}
                        onChange={handleManualAttachmentsChange}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 sm:col-span-2">
                      <DialogClose asChild>
                        <Button variant="outline" size="sm" type="button">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button size="sm" onClick={handleCreateManual}>
                        Save record
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="w-[min(96vw,920px)] sm:max-w-[920px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Record details</DialogTitle>
                    <DialogDescription>
                      Review the record metadata, content, and attachments.
                    </DialogDescription>
                  </DialogHeader>
                  {activeRecord ? (
                    <div className="grid gap-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Title</p>
                          <p className="text-sm font-semibold">
                            {activeRecord.title}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="text-sm font-semibold">
                            {activeRecord.recordType || "N/A"}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="text-sm font-semibold">
                            {activeRecord.category || "N/A"}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-sm font-semibold">
                            {activeRecord.status || "Processed"}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Provider</p>
                          <p className="text-sm font-semibold">
                            {activeRecord.provider || "N/A"}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="text-sm font-semibold">
                            {formatDate(activeRecord.recordDate || activeRecord.createdAt)}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Diagnosis</p>
                          <p className="text-sm font-semibold">
                            {activeRecord.diagnosis || "N/A"}
                          </p>
                        </div>
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Visit type</p>
                          <p className="text-sm font-semibold">
                            {activeRecord.visitType || "N/A"}
                          </p>
                        </div>
                      </div>

                      {activeRecord.content ? (
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Content</p>
                          <p className="text-sm whitespace-pre-wrap">
                            {activeRecord.content}
                          </p>
                        </div>
                      ) : null}

                      {activeRecord.notes ? (
                        <div className="grid gap-1">
                          <p className="text-xs text-muted-foreground">Notes</p>
                          <p className="text-sm whitespace-pre-wrap">
                            {activeRecord.notes}
                          </p>
                        </div>
                      ) : null}

                      {activeRecord.structuredData &&
                        Object.keys(activeRecord.structuredData).length ? (
                        <div className="grid gap-2">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Structured data
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {Object.entries(activeRecord.structuredData).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="rounded-lg border bg-muted/10 px-3 py-2"
                                >
                                  <p className="text-xs text-muted-foreground">
                                    {key}
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {formatStructuredValue(value) || "N/A"}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : null}

                      <div className="grid gap-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Attachments
                        </p>
                        {activeRecord.attachments?.length ? (
                          <div className="grid gap-3">
                            {activeRecord.attachments.map((attachment, index) => {
                              const isPdf = isPdfAttachment(attachment)
                              const isImage = isImageAttachment(attachment)
                              const previewUrl = isPdf
                                ? buildCloudinaryPdfPreviewUrl(attachment.url)
                                : attachment.url
                              return (
                                <div
                                  key={`${attachment.url}-${index}`}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-background">
                                      {isImage || previewUrl ? (
                                        <img
                                          src={previewUrl || attachment.url}
                                          alt={attachment.name || "Attachment"}
                                          className="h-full w-full rounded-md object-cover"
                                        />
                                      ) : (
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">
                                        {attachment.name || "Attachment"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(attachment.size)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isImage || isPdf ? (
                                      <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={() =>
                                          window.open(
                                            isPdf
                                              ? buildFileProxyUrl(
                                                attachment.url,
                                                false,
                                                attachment.name
                                              )
                                              : attachment.url,
                                            "_blank",
                                            "noopener,noreferrer"
                                          )
                                        }
                                      >
                                        {isPdf ? "Open PDF" : "Preview"}
                                      </Button>
                                    ) : null}
                                    <Button
                                      variant="outline"
                                      size="xs"
                                      onClick={() =>
                                        void downloadUrl(
                                          attachment.url,
                                          attachment.name
                                        )
                                      }
                                    >
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No attachments found.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setViewDialogOpen(false)
                          }}
                        >
                          Close
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setViewDialogOpen(false)
                            openEditRecord(activeRecord)
                          }}
                        >
                          Edit record
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="w-[min(96vw,920px)] sm:max-w-[920px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit record</DialogTitle>
                    <DialogDescription>
                      Update the details and save your changes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-2">
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editDraft.title}
                        onChange={(event) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Record title"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="edit-date">Date</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editDraft.date}
                        onChange={(event) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            date: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Category</Label>
                      <Select
                        value={editDraft.category}
                        onValueChange={(value) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions
                            .filter((item) => item !== "All")
                            .map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label>Record type</Label>
                      <Select
                        value={editRecordType}
                        onValueChange={setEditRecordType}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                        <SelectContent>
                          {recordTypes.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="edit-provider">Provider</Label>
                      <Input
                        id="edit-provider"
                        value={editDraft.provider}
                        onChange={(event) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            provider: event.target.value,
                          }))
                        }
                        placeholder="Clinic or doctor"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Visit type</Label>
                      <Select
                        value={editDraft.visitType}
                        onValueChange={(value) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            visitType: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultVisitTypes.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="edit-diagnosis">Diagnosis</Label>
                      <Input
                        id="edit-diagnosis"
                        value={editDraft.diagnosis}
                        onChange={(event) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            diagnosis: event.target.value,
                          }))
                        }
                        placeholder="Diagnosis or condition"
                      />
                    </div>
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="edit-content">Record content</Label>
                      <Textarea
                        id="edit-content"
                        value={editDraft.content}
                        onChange={(event) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            content: event.target.value,
                          }))
                        }
                        placeholder="Summary of the visit or report"
                      />
                    </div>
                    {typeFieldMap[editRecordType]?.length ? (
                      <div className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Structured fields
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {typeFieldMap[editRecordType].map((field) => (
                            <div className="grid gap-1" key={field.key}>
                              <Label htmlFor={`edit-structured-${field.key}`}>
                                {field.label}
                              </Label>
                              <Input
                                id={`edit-structured-${field.key}`}
                                value={editStructured[field.key] ?? ""}
                                onChange={(event) =>
                                  updateStructuredField(
                                    "edit",
                                    field.key,
                                    event.target.value
                                  )
                                }
                                placeholder={field.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="grid gap-3 rounded-lg border bg-muted/10 p-3 sm:col-span-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Custom fields
                        </p>
                        <Button
                          variant="outline"
                          size="xs"
                          type="button"
                          onClick={() => addCustomField("edit")}
                        >
                          Add field
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        {editCustomFields.map((field, index) => (
                          <div
                            key={`edit-custom-${index}`}
                            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                          >
                            <Input
                              placeholder="Key"
                              value={field.key}
                              onChange={(event) =>
                                updateCustomField(
                                  "edit",
                                  index,
                                  "key",
                                  event.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Value"
                              value={field.value}
                              onChange={(event) =>
                                updateCustomField(
                                  "edit",
                                  index,
                                  "value",
                                  event.target.value
                                )
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => removeCustomField("edit", index)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="edit-notes">Notes</Label>
                      <Textarea
                        id="edit-notes"
                        value={editDraft.notes}
                        onChange={(event) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Additional context or next steps"
                      />
                    </div>
                    {activeRecord?.attachments?.length ? (
                      <div className="grid gap-2 sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Existing attachments (read-only)
                        </p>
                        <div className="grid gap-2">
                          {activeRecord.attachments.map((attachment, index) => (
                            <div
                              key={`edit-attachment-${index}`}
                              className="flex items-center justify-between rounded-lg border bg-muted/10 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {attachment.name || "Attachment"}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  void downloadUrl(attachment.url, attachment.name)
                                }
                              >
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="grid gap-1 sm:col-span-2">
                      <Label htmlFor="edit-attachments">Add attachments</Label>
                      <Input
                        id="edit-attachments"
                        type="file"
                        multiple
                        ref={editAttachmentsRef}
                        onChange={handleEditAttachmentsChange}
                      />
                    </div>
                    {editAttachments.length ? (
                      <div className="grid gap-2 sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          New attachments
                        </p>
                        <div className="grid gap-2">
                          {editAttachments.map((file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="flex items-center justify-between rounded-lg border bg-muted/10 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => removeEditAttachment(index)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-end gap-2 sm:col-span-2">
                      <DialogClose asChild>
                        <Button variant="outline" size="sm" type="button">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button size="sm" onClick={handleUpdateRecord}>
                        Save changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <StatGrid
            items={overviewStats}
            columns={4}
            className="border-primary/15 ring-1 ring-primary/5"
          />
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-primary/15 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Sort by
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-[160px] rounded-full border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Category
              </Label>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="h-9 w-[170px] rounded-full border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[150px] rounded-full border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Provider
              </Label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="h-9 w-[180px] rounded-full border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Any provider" />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Date range
              </Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-9 w-[150px] rounded-full border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                className="h-6 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <FolderOpen className="h-4 w-4" />
                  Manage folders
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Manage folders</SheetTitle>
                  <SheetDescription>
                    Organize records by category and source.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-3 px-4">
                  {folderRows.length ? (
                    folderRows.map((folder) => (
                      <div
                        key={folder.name}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {folder.count} docs - Updated {folder.updated}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setActiveCategory(folder.name)
                            setFolderSheetOpen(false)
                          }}
                        >
                          Filter
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No folders yet. Add a record to create one.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setFolderSheetOpen(false)
                      setManualDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add category
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-2xl border border-primary/15 bg-white shadow-sm ring-1 ring-primary/5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3">
              <div>
                <p className="text-base font-semibold text-slate-900">Documents</p>
                <p className="text-sm text-slate-500">
                  {filteredDocuments.length} documents - {aiProcessedCount} AI processed
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13px]">
                <colgroup>
                  <col className="w-[44%]" />
                  <col className="w-[18%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="text-[11px] text-slate-500">
                  <tr className="border-b border-slate-200 bg-primary/5">
                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">
                      Last activity
                    </th>
                    <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right font-semibold uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length ? (
                    filteredDocuments.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-200 transition hover:bg-primary/5"
                      >
                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-tight text-slate-900">
                              {row.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row.type}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {row.provider}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {row.dateLabel}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-[#1F7AE0]/10 px-3 py-1 text-xs font-semibold text-[#1F7AE0]">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => {
                                  const record = findRecordById(row.id)
                                  if (record) openViewRecord(record)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View record
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  const record = findRecordById(row.id)
                                  if (record) openAttachmentByType(record, "pdf")
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View as PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  const record = findRecordById(row.id)
                                  if (record) openAttachmentByType(record, "image")
                                }}
                              >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                View as image
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  const record = findRecordById(row.id)
                                  const attachment = record?.attachments?.[0]
                                  if (!attachment?.url) {
                                    toast.error("No attachment available")
                                    return
                                  }
                                  void downloadUrl(attachment.url, attachment.name)
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  const record = findRecordById(row.id)
                                  if (record) openEditRecord(record)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => {
                                  const record = findRecordById(row.id)
                                  if (record) handleDeleteRecord(record)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No records match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 px-4 py-3 text-sm text-slate-500">
              <span>
                Showing {pageStart} - {pageEnd} of{" "}
                {pagination?.total ?? filteredDocuments.length} documents
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                  disabled={!pagination?.hasPrev}
                  onClick={() => {
                    if (pagination?.hasPrev) {
                      setPage((prev) => Math.max(1, prev - 1))
                    }
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                  disabled={!pagination?.hasNext}
                  onClick={() => {
                    if (pagination?.hasNext) {
                      setPage((prev) => prev + 1)
                    }
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </section>

          <aside className="flex h-fit flex-col gap-4 xl:sticky xl:top-6">
            <section className="rounded-2xl border border-primary/15 bg-white shadow-sm ring-1 ring-primary/5">
              <div className="border-b border-slate-200/70 px-5 py-4">
                <p className="text-base font-semibold text-slate-900">AI scan intake</p>
                <p className="text-sm text-slate-500">
                  Upload a file to generate a draft record.
                </p>
              </div>
              <div className="space-y-3 px-5 py-4">
                <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4 text-center">
                  <CloudUpload className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    Drop files here or click to upload
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    JPG, PNG, WEBP up to 5 MB.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleScanClick}
                  >
                    Select files
                  </Button>
                </div>
                {selectedFile && (
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-white">
                        {selectedFileUrl ? (
                          <img
                            src={selectedFileUrl}
                            alt={selectedFile.name}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <FileImage className="h-5 w-5 text-primary/70" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="xs"
                        className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                        onClick={handleScanClick}
                      >
                        Replace
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1.5 text-[11px] text-slate-500">
                  <span className="rounded-full border border-primary/20 bg-white px-2 py-0.5 text-slate-600">
                    JPG
                  </span>
                  <span className="rounded-full border border-primary/20 bg-white px-2 py-0.5 text-slate-600">
                    PNG
                  </span>
                  <span className="rounded-full border border-primary/20 bg-white px-2 py-0.5 text-slate-600">
                    WEBP
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-primary/15 bg-white shadow-sm ring-1 ring-primary/5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">AI insights</p>
                  <p className="text-sm text-slate-500">
                    Suggestions based on uploaded records only.
                  </p>
                </div>

              </div>
              <div className="space-y-3 px-5 py-4 text-sm">
                {aiInsightsLoading ? (
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-slate-500">
                    Generating insights...
                  </div>
                ) : null}
                {aiInsightsError ? (
                  <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {aiInsightsError}
                  </div>
                ) : null}
                {aiInsights.length ? (
                  aiInsights.map((item) => (
                    <div
                      key={`${item.title}-${item.time}`}
                      className="rounded-2xl border border-primary/10 bg-primary/5 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${insightBadgeClasses[item.level]}`}
                        >
                          {item.level}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {item.detail}
                      </p>
                    </div>
                  ))
                ) : !aiInsightsLoading ? (
                  <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-5 text-sm text-slate-500">
                    No insights available yet.
                  </div>
                ) : null}

              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
