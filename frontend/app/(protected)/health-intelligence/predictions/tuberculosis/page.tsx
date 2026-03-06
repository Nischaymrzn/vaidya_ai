"use client"

import Image from "next/image"
import { useEffect, useMemo, useState, useTransition } from "react"
import {
  Activity,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Stethoscope,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ReportDownloadButton } from "../_components/report-download"
import { predictTuberculosis } from "@/lib/actions/prediction-action"
import type { TTuberculosisPredictionResponse } from "@/lib/definition"

type TbSymptoms = {
  cough: boolean
  fever: boolean
  nightSweats: boolean
  weightLoss: boolean
  exposure: boolean
}

const initialSymptoms: TbSymptoms = {
  cough: false,
  fever: false,
  nightSweats: false,
  weightLoss: false,
  exposure: false,
}

const riskBadgeStyles: Record<string, string> = {
  High: "bg-rose-100 text-rose-700",
  Moderate: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
}

const priorityStyles: Record<string, string> = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Info: "border-slate-200 bg-slate-50 text-slate-600",
}

const normalizeLabel = (value: string) => value.toLowerCase().trim()

const getTuberculosisProbability = (
  prediction: TTuberculosisPredictionResponse | null,
) =>
  prediction?.probabilities.find((item) => {
    const normalized = normalizeLabel(item.label)
    return normalized === "tb" || normalized.includes("tuberculosis")
  })?.probability ??
  prediction?.probability ??
  null

const getNormalProbability = (
  prediction: TTuberculosisPredictionResponse | null,
) =>
  prediction?.probabilities.find((item) =>
    normalizeLabel(item.label).includes("normal"),
  )?.probability ?? null

export default function TuberculosisPredictionPage() {
  const [symptoms, setSymptoms] = useState<TbSymptoms>(initialSymptoms)
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [analysisRequested, setAnalysisRequested] = useState(false)
  const [prediction, setPrediction] = useState<TTuberculosisPredictionResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const tbProbability = getTuberculosisProbability(prediction)
  const normalProbability = getNormalProbability(prediction)
  const riskLevel = prediction?.riskLevel ?? "Low"
  const badgeStyle = riskBadgeStyles[riskLevel] ?? "bg-slate-100 text-slate-600"

  const summary = prediction
    ? riskLevel === "High"
      ? "Model indicates elevated TB likelihood. Prompt clinical follow-up is recommended."
      : riskLevel === "Moderate"
        ? "Model indicates moderate TB likelihood. Correlate with symptoms and clinician advice."
        : "Model indicates lower TB likelihood on this scan."
    : "Run analysis to view imaging prediction and guidance."

  const reportMetrics = useMemo(
    () => [
      {
        investigation: "Predicted TB probability",
        result: analysisRequested && tbProbability !== null ? `${tbProbability}` : "N/A",
        reference: "<35 low | 35-59 moderate | >=60 high",
        status: analysisRequested && prediction ? riskLevel : "Pending",
        unit: "%",
      },
      {
        investigation: "Normal class probability",
        result: analysisRequested && normalProbability !== null ? `${normalProbability}` : "N/A",
        reference: "Complementary class",
        status: analysisRequested && prediction ? "Computed" : "Pending",
        unit: "%",
      },
      {
        investigation: "Persistent cough",
        result: symptoms.cough ? "Present" : "Absent",
        reference: "Clinical symptom",
        status: symptoms.cough ? "Positive" : "Negative",
        unit: "",
      },
      {
        investigation: "Fever / night sweats",
        result: symptoms.fever || symptoms.nightSweats ? "Present" : "Absent",
        reference: "Clinical symptom",
        status: symptoms.fever || symptoms.nightSweats ? "Positive" : "Negative",
        unit: "",
      },
      {
        investigation: "Weight loss / exposure",
        result: symptoms.weightLoss || symptoms.exposure ? "Present" : "Absent",
        reference: "Clinical symptom",
        status: symptoms.weightLoss || symptoms.exposure ? "Positive" : "Negative",
        unit: "",
      },
      {
        investigation: "Scan uploaded",
        result: file ? "Yes" : "No",
        reference: "Required for inference",
        status: file ? "Available" : "Missing",
        unit: "",
      },
    ],
    [analysisRequested, tbProbability, normalProbability, prediction, riskLevel, symptoms, file],
  )

  const reportComments = useMemo(
    () => [
      analysisRequested && prediction
        ? `${riskLevel} tuberculosis risk generated from scan + symptom profile.`
        : "Analysis pending. Upload scan and run the model to generate interpretation.",
      "This result is screening support and must be correlated with clinician-guided diagnostics.",
    ],
    [analysisRequested, prediction, riskLevel],
  )

  const reportFindings = useMemo(
    () =>
      prediction?.insights?.length
        ? prediction.insights.map((item) => `${item.title}: ${item.description}`)
        : ["No model findings available."],
    [prediction],
  )

  const reportRecommendations = useMemo(
    () => [
      "Confirm high-risk output with laboratory and clinician-guided TB workup.",
      "Track symptom persistence and progression daily.",
      "Upload additional scan follow-ups when available.",
    ],
    [],
  )

  const handleAnalyze = () => {
    setAnalysisRequested(true)
    setErrorMessage(null)
    setPrediction(null)

    if (!file) {
      setErrorMessage("Please upload a scan image before analysis.")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await predictTuberculosis(formData)

      if (!result.success || !result.data) {
        setPrediction(null)
        setErrorMessage(result.message || "Unable to generate tuberculosis prediction.")
        return
      }

      setPrediction(result.data)
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Tuberculosis Prediction
              </h1>
              <p className="text-sm text-slate-500">
                Upload MRI or chest scan images and capture symptom signals for AI inference.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Scan and symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload MRI or chest scan image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                {previewUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200/70">
                    <Image
                      src={previewUrl}
                      alt="Scan preview"
                      width={896}
                      height={208}
                      className="h-52 w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
                    <Upload className="h-5 w-5" />
                    Upload a scan to preview.
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "cough", label: "Persistent cough" },
                    { key: "fever", label: "Fever" },
                    { key: "nightSweats", label: "Night sweats" },
                    { key: "weightLoss", label: "Weight loss" },
                    { key: "exposure", label: "Exposure history" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/70 px-3 py-2"
                    >
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <Switch
                        checked={symptoms[item.key as keyof TbSymptoms]}
                        onCheckedChange={(checked) =>
                          setSymptoms((prev) => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Clinician notes (optional)</Label>
                  <Textarea
                    value={notes}
                    placeholder="Add observation notes or context for the model."
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
                <Button className="w-full rounded-full" onClick={handleAnalyze} disabled={isPending}>
                  {isPending ? "Analyzing..." : "Analyze TB risk"}
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
                      <p className="text-sm text-slate-500">TB probability</p>
                      <p className="text-3xl font-semibold text-slate-900">
                        {analysisRequested && tbProbability !== null ? `${tbProbability}%` : "--"}
                      </p>
                    </div>
                    <Badge className={badgeStyle}>
                      {analysisRequested && prediction ? `${riskLevel} risk` : "Waiting"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {analysisRequested ? summary : "Run analysis to view imaging prediction and guidance."}
                  </div>
                  {analysisRequested && errorMessage ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                      {errorMessage}
                    </div>
                  ) : null}
                  <div className="grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Prediction</span>
                      <span className="font-medium text-slate-900">
                        {prediction?.prediction ?? "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Normal class probability</span>
                      <span className="font-medium text-slate-900">
                        {analysisRequested && normalProbability !== null
                          ? `${normalProbability}%`
                          : "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Model confidence</span>
                      <span className="font-medium text-slate-900">
                        {analysisRequested && prediction ? `${prediction.probability}%` : "--"}
                      </span>
                    </div>
                  </div>
                  <ReportDownloadButton
                    title="Tuberculosis Risk Report"
                    filename="tuberculosis-risk-report.pdf"
                    patient={{
                      name: "Member",
                      age: "N/A",
                      sex: "N/A",
                      pid: "TB-001",
                    }}
                    meta={{
                      module: "Tuberculosis Prediction",
                      referredBy: "Vaidya AI",
                      collectedAt: new Date().toLocaleDateString("en-US"),
                    }}
                    metrics={reportMetrics}
                    comments={reportComments}
                    findings={reportFindings}
                    recommendations={reportRecommendations}
                    notes={notes.trim() ? [notes.trim()] : []}
                    disabled={!prediction}
                    className="w-full rounded-full"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">Insights & guidance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  {prediction?.insights?.length ? (
                    prediction.insights.map((insight, index) => (
                      <div
                        key={`${insight.title}-${index}`}
                        className={`rounded-2xl border px-4 py-3 ${priorityStyles[insight.priority] ?? priorityStyles.Info}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                            {insight.priority === "High" ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : insight.priority === "Medium" ? (
                              <ShieldAlert className="h-4 w-4" />
                            ) : insight.priority === "Low" ? (
                              <Activity className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{insight.title}</p>
                            <p className="text-sm text-slate-600">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                      Generate a prediction to view personalized insights.
                    </div>
                  )}
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Clinical confirmation</p>
                      <p>AI output is a screening aid. Confirm with clinician-guided tests.</p>
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
