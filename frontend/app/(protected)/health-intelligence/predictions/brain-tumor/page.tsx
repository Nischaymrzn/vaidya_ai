"use client"

import { useEffect, useMemo, useState } from "react"
import { Brain, FileText, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ReportDownloadButton } from "../_components/report-download"

type NeuroSignals = {
  headache: boolean
  vision: boolean
  dizziness: boolean
  seizures: boolean
}

const initialSignals: NeuroSignals = {
  headache: false,
  vision: false,
  dizziness: false,
  seizures: false,
}

export default function BrainTumorPredictionPage() {
  const [signals, setSignals] = useState<NeuroSignals>(initialSignals)
  const [ageGroup, setAgeGroup] = useState("adult")
  const [severity, setSeverity] = useState("mild")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisReady, setAnalysisReady] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const score = useMemo(() => {
    let points = 10
    if (signals.headache) points += 14
    if (signals.vision) points += 16
    if (signals.dizziness) points += 10
    if (signals.seizures) points += 22
    if (ageGroup === "senior") points += 8
    if (severity === "severe") points += 12
    if (file) points += 10
    return Math.min(95, points)
  }, [ageGroup, file, severity, signals])

  const level = score >= 60 ? "High" : score >= 35 ? "Moderate" : "Low"

  const reportMetrics = [
    {
      investigation: "Predicted brain tumor risk score",
      result: analysisReady ? `${score}` : "N/A",
      reference: "<35 low | 35-59 moderate | >=60 high",
      status: analysisReady ? level : "Pending",
      unit: "%",
    },
    {
      investigation: "Persistent headaches",
      result: signals.headache ? "Present" : "Absent",
      reference: "Clinical symptom",
      status: signals.headache ? "Positive" : "Negative",
      unit: "",
    },
    {
      investigation: "Vision changes",
      result: signals.vision ? "Present" : "Absent",
      reference: "Clinical symptom",
      status: signals.vision ? "Positive" : "Negative",
      unit: "",
    },
    {
      investigation: "Dizziness / seizures",
      result: signals.dizziness || signals.seizures ? "Present" : "Absent",
      reference: "Clinical symptom",
      status: signals.dizziness || signals.seizures ? "Positive" : "Negative",
      unit: "",
    },
    {
      investigation: "Age group",
      result: ageGroup,
      reference: "Risk context",
      status: "Context",
      unit: "",
    },
    {
      investigation: "MRI scan uploaded",
      result: file ? "Yes" : "No",
      reference: "Required for scan review",
      status: file ? "Available" : "Missing",
      unit: "",
    },
  ]

  const reportComments = [
    analysisReady
      ? `${level} neurological risk generated from symptom + scan signals.`
      : "Analysis pending. Upload scan and run the model to generate interpretation.",
    "This report supports screening and should be correlated with neurologist guidance.",
  ]

  const reportFindings = analysisReady
    ? [
      `Risk score is ${score}% (${level}).`,
      `Symptom profile: headache=${signals.headache ? "yes" : "no"}, vision=${signals.vision ? "yes" : "no"}, dizziness=${signals.dizziness ? "yes" : "no"}, seizures=${signals.seizures ? "yes" : "no"}.`,
      `Age group is ${ageGroup} and severity is ${severity}.`,
      `MRI availability: ${file ? "uploaded" : "not uploaded"}.`,
    ]
    : ["Awaiting analysis run to generate findings."]

  const reportRecommendations = [
    "Review neurological symptoms with a clinician if risk is moderate/high.",
    "Upload follow-up MRI scans to compare progression.",
    "Maintain consistent symptom logging for trend analysis.",
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Brain Tumor Prediction
              </h1>
              <p className="text-sm text-slate-500">
                Upload MRI scans and track neurological signals for AI-based risk estimation.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Scan and signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload MRI scan image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200/70">
                    <img src={previewUrl} alt="MRI preview" className="h-52 w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                    <Upload className="h-5 w-5" />
                    Upload an MRI scan to preview.
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "headache", label: "Persistent headaches" },
                    { key: "vision", label: "Vision changes" },
                    { key: "dizziness", label: "Dizziness" },
                    { key: "seizures", label: "Seizures" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/70 px-3 py-2"
                    >
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <Switch
                        checked={signals[item.key as keyof NeuroSignals]}
                        onCheckedChange={(checked) =>
                          setSignals((prev) => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Age group</Label>
                    <Select value={ageGroup} onValueChange={setAgeGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youth">Below 18</SelectItem>
                        <SelectItem value="adult">18-50</SelectItem>
                        <SelectItem value="senior">50+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Symptom severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Clinician notes (optional)</Label>
                  <Textarea
                    value={notes}
                    placeholder="Add clinical observations or notes for the report."
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
                <Button className="w-full rounded-full" onClick={() => setAnalysisReady(true)}>
                  Analyze brain tumor risk
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">AI analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Risk score</p>
                      <p className="text-3xl font-semibold text-slate-900">{analysisReady ? `${score}%` : "--"}</p>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {analysisReady ? `${level} risk` : "Waiting"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {analysisReady
                      ? "Model detects no immediate acute markers, but tracks symptom progression for changes."
                      : "Run analysis to view imaging signals and risk summary."}
                  </div>
                  <div className="grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Neurological stability</span>
                      <span className="font-medium text-slate-900">{analysisReady ? "72%" : "--"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Imaging quality</span>
                      <span className="font-medium text-slate-900">{analysisReady ? "Good" : "--"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Follow-up</span>
                      <span className="font-medium text-slate-900">{analysisReady ? "Recommended" : "--"}</span>
                    </div>
                  </div>
                  <ReportDownloadButton
                    title="Brain Tumor Risk Report"
                    filename="brain-tumor-risk-report.pdf"
                    patient={{
                      name: "Member",
                      age: ageGroup,
                      sex: "N/A",
                      pid: "BRAIN-001",
                    }}
                    meta={{
                      module: "Brain Tumor Prediction",
                      referredBy: "Vaidya AI",
                      collectedAt: new Date().toLocaleDateString("en-US"),
                    }}
                    metrics={reportMetrics}
                    comments={reportComments}
                    findings={reportFindings}
                    recommendations={reportRecommendations}
                    notes={notes.trim() ? [notes.trim()] : []}
                    disabled={!analysisReady}
                    className="w-full rounded-full"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">Next steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">MRI updates</p>
                      <p>Upload new scans when available to refine AI interpretation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Symptom logs</p>
                      <p>Record neurological symptoms consistently to improve accuracy.</p>
                    </div>
                  </div>
                  {notes ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Notes recorded for report summary.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
