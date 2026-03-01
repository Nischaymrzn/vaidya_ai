"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Activity,
  Brain,
  FileText,
  HeartPulse,
  ShieldCheck,
  Waves,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReportDownloadButton } from "../_components/report-download"
import { predictHeartDisease } from "@/lib/actions/prediction-action"
import type { THeartDiseasePredictionResponse } from "@/lib/definition"

type HeartDiseaseForm = {
  gender: string
  smoking_history: string
  age: string
  bmi: string
  HbA1c_level: string
  blood_glucose_level: string
  hypertension: string
  heart_disease: string
}

const genderOptions = ["Female", "Male"]
const smokingOptions = ["No Info", "current", "ever", "former", "never", "not current"]

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

const getPredictionLabel = (value?: number) =>
  value === 1 ? "Heart disease likely" : value === 0 ? "Heart disease unlikely" : "Pending"

const buildReportLines = (
  form: HeartDiseaseForm,
  prediction: THeartDiseasePredictionResponse | null,
) => {
  if (!prediction) return []
  const heartProbability =
    prediction.probabilities.find((item) => item.label === 1)?.probability ??
    prediction.probability
  const nonHeartProbability =
    prediction.probabilities.find((item) => item.label === 0)?.probability ?? 0
  const lines: string[] = [
    `Generated: ${new Date().toLocaleDateString("en-US")}`,
    "",
    "Summary",
    `Risk level: ${prediction.riskLevel}`,
    `Heart disease probability: ${heartProbability}%`,
    `Non-heart disease probability: ${nonHeartProbability}%`,
    `Prediction: ${getPredictionLabel(prediction.prediction)}`,
    "",
    "Input profile",
    `Gender: ${form.gender || "N/A"}`,
    `Smoking history: ${form.smoking_history || "N/A"}`,
    `Age: ${form.age || "N/A"}`,
    `BMI: ${form.bmi || "N/A"}`,
    `HbA1c: ${form.HbA1c_level || "N/A"}%`,
    `Blood glucose: ${form.blood_glucose_level || "N/A"} mg/dL`,
    `Hypertension: ${form.hypertension === "1" ? "Yes" : "No"}`,
    `Cardiac history: ${form.heart_disease === "1" ? "Yes" : "No"}`,
    "",
    "Insights",
    ...prediction.insights.map(
      (item, index) => `${index + 1}. ${item.title} - ${item.description}`,
    ),
    "",
    "Notes",
    "This report is informational and based on the provided data.",
  ]

  return lines
}

export default function HeartDiseasePredictionPage() {
  const [form, setForm] = useState<HeartDiseaseForm>({
    gender: "Female",
    smoking_history: "No Info",
    age: "",
    bmi: "",
    HbA1c_level: "",
    blood_glucose_level: "",
    hypertension: "0",
    heart_disease: "0",
  })
  const [analysisRequested, setAnalysisRequested] = useState(false)
  const [prediction, setPrediction] = useState<THeartDiseasePredictionResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isComplete = Boolean(
    form.gender &&
      form.smoking_history &&
      form.age &&
      form.bmi &&
      form.HbA1c_level &&
      form.blood_glucose_level,
  )

  const heartProbability =
    prediction?.probabilities.find((item) => item.label === 1)?.probability ??
    prediction?.probability ??
    null
  const nonHeartProbability =
    prediction?.probabilities.find((item) => item.label === 0)?.probability ?? null
  const riskLevel = prediction?.riskLevel ?? "Low"
  const badgeStyle = riskBadgeStyles[riskLevel] ?? "bg-slate-100 text-slate-600"

  const summary = prediction
    ? riskLevel === "High"
      ? "Signals indicate elevated cardiovascular risk. Review the drivers and consider follow-up testing."
      : riskLevel === "Moderate"
        ? "Moderate risk detected. Small improvements in lifestyle and monitoring can help."
        : "Low risk detected based on current inputs and history signals."
    : "Run analysis to view personalized risk and insights."

  const reportLines = useMemo(
    () => buildReportLines(form, prediction),
    [form, prediction],
  )

  const handleAnalyze = () => {
    setAnalysisRequested(true)
    setErrorMessage(null)
    setPrediction(null)

    if (!isComplete) {
      setErrorMessage("Please fill all fields to generate a prediction.")
      return
    }

    startTransition(async () => {
      const payload = {
        gender: form.gender,
        smoking_history: form.smoking_history,
        age: form.age,
        bmi: form.bmi,
        HbA1c_level: form.HbA1c_level,
        blood_glucose_level: form.blood_glucose_level,
        hypertension: form.hypertension,
        heart_disease: form.heart_disease,
      }

      const result = await predictHeartDisease(payload)
      if (!result.success || !result.data) {
        setPrediction(null)
        setErrorMessage(result.message || "Unable to generate prediction.")
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
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Brain className="h-4 w-4" />
                AI Prediction Suite
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Heart Disease Prediction
              </h1>
              <p className="text-sm text-slate-500">
                Personalized estimates based on blood pressure, metabolic markers, lifestyle, and history.
              </p>
            </div>
            <Badge className="bg-rose-100 text-rose-700">Cardiovascular model</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Input profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Smoking history</Label>
                    <Select
                      value={form.smoking_history}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, smoking_history: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking history" />
                      </SelectTrigger>
                      <SelectContent>
                        {smokingOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      value={form.age}
                      inputMode="numeric"
                      placeholder="45"
                      onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BMI</Label>
                    <Input
                      value={form.bmi}
                      inputMode="decimal"
                      placeholder="27.5"
                      onChange={(event) => setForm((prev) => ({ ...prev, bmi: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HbA1c (%)</Label>
                    <Input
                      value={form.HbA1c_level}
                      inputMode="decimal"
                      placeholder="5.8"
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, HbA1c_level: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood glucose (mg/dL)</Label>
                    <Input
                      value={form.blood_glucose_level}
                      inputMode="numeric"
                      placeholder="118"
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          blood_glucose_level: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hypertension</Label>
                    <Select
                      value={form.hypertension}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, hypertension: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hypertension" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cardiac history</Label>
                    <Select
                      value={form.heart_disease}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, heart_disease: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cardiac history" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No</SelectItem>
                        <SelectItem value="1">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full rounded-full" onClick={handleAnalyze} disabled={isPending}>
                  {isPending ? "Analyzing..." : "Analyze heart risk"}
                </Button>
                <p className="text-xs text-slate-500">
                  Results combine your input with recent health history to fine-tune probability.
                </p>
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
                      <p className="text-sm text-slate-500">Heart disease probability</p>
                      <p className="text-3xl font-semibold text-slate-900">
                        {analysisRequested && heartProbability !== null ? `${heartProbability}%` : "--"}
                      </p>
                    </div>
                    <Badge className={badgeStyle}>
                      {analysisRequested && prediction ? `${riskLevel} risk` : "Waiting"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {analysisRequested ? summary : "Run analysis to view personalized insights and recommendations."}
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
                        {prediction ? getPredictionLabel(prediction.prediction) : "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Non-heart disease probability</span>
                      <span className="font-medium text-slate-900">
                        {analysisRequested && nonHeartProbability !== null
                          ? `${nonHeartProbability}%`
                          : "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>History adjustment</span>
                      <span className="font-medium text-slate-900">
                        {analysisRequested && prediction ? "Applied" : "--"}
                      </span>
                    </div>
                  </div>
                  <ReportDownloadButton
                    title="Heart Disease Risk Report"
                    filename="heart-disease-risk-report.pdf"
                    lines={reportLines}
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
                              <ShieldCheck className="h-4 w-4" />
                            ) : insight.priority === "Medium" ? (
                              <HeartPulse className="h-4 w-4" />
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
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">Lifestyle signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Waves className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Blood pressure rhythm</p>
                      <p>Steady activity and lower sodium intake help keep pressure stable.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Lab follow-up</p>
                      <p>Keep metabolic labs updated to strengthen cardiovascular insights.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
