"use client"

import { useMemo, useState } from "react"
import { Brain, Droplets, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReportDownloadButton } from "../_components/report-download"

type DiabetesForm = {
  glucose: string
  hba1c: string
  bmi: string
  age: string
  familyHistory: string
  bloodPressure: string
}

const clamp = (value: number, min = 5, max = 95) => Math.min(max, Math.max(min, value))

const parseNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export default function DiabetesPredictionPage() {
  const [form, setForm] = useState<DiabetesForm>({
    glucose: "",
    hba1c: "",
    bmi: "",
    age: "",
    familyHistory: "no",
    bloodPressure: "",
  })
  const [analysisReady, setAnalysisReady] = useState(false)

  const score = useMemo(() => {
    const glucose = parseNumber(form.glucose) ?? 95
    const hba1c = parseNumber(form.hba1c) ?? 5.4
    const bmi = parseNumber(form.bmi) ?? 23
    const age = parseNumber(form.age) ?? 32
    const bp = parseNumber(form.bloodPressure) ?? 118

    let points = 18
    if (glucose > 110) points += (glucose - 110) * 0.5
    if (hba1c > 5.7) points += (hba1c - 5.7) * 12
    if (bmi > 25) points += (bmi - 25) * 1.4
    if (age > 45) points += (age - 45) * 0.6
    if (bp > 130) points += (bp - 130) * 0.4
    if (form.familyHistory === "yes") points += 12
    return clamp(Math.round(points))
  }, [form])

  const level = score >= 60 ? "High" : score >= 35 ? "Moderate" : "Low"

  const reportLines = [
    `Risk score: ${score}% (${level})`,
    `Glucose: ${form.glucose || "N/A"} mg/dL`,
    `HbA1c: ${form.hba1c || "N/A"} %`,
    `BMI: ${form.bmi || "N/A"}`,
    `Blood pressure: ${form.bloodPressure || "N/A"} mmHg`,
    `Family history: ${form.familyHistory}`,
    "Summary: Consistent monitoring and updated lab records recommended.",
  ]

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
                Diabetes Prediction
              </h1>
              <p className="text-sm text-slate-500">
                Fast risk estimation based on metabolic markers and lifestyle signals.
              </p>
            </div>
            <Badge className="bg-sky-100 text-sky-700">Clinical preview</Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
            <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Input profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fasting glucose (mg/dL)</Label>
                    <Input
                      value={form.glucose}
                      inputMode="numeric"
                      placeholder="95"
                      onChange={(event) => setForm((prev) => ({ ...prev, glucose: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HbA1c (%)</Label>
                    <Input
                      value={form.hba1c}
                      inputMode="decimal"
                      placeholder="5.4"
                      onChange={(event) => setForm((prev) => ({ ...prev, hba1c: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BMI</Label>
                    <Input
                      value={form.bmi}
                      inputMode="decimal"
                      placeholder="23.4"
                      onChange={(event) => setForm((prev) => ({ ...prev, bmi: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      value={form.age}
                      inputMode="numeric"
                      placeholder="32"
                      onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood pressure (systolic)</Label>
                    <Input
                      value={form.bloodPressure}
                      inputMode="numeric"
                      placeholder="118"
                      onChange={(event) => setForm((prev) => ({ ...prev, bloodPressure: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Family history</Label>
                    <Select
                      value={form.familyHistory}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, familyHistory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Family history" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full rounded-full" onClick={() => setAnalysisReady(true)}>
                  Analyze diabetes risk
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
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {analysisReady ? `${level} risk` : "Waiting"}
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {analysisReady
                      ? "Glucose and HbA1c trends suggest stable metabolic control, but keep an eye on BMI and BP."
                      : "Run analysis to view personalized insights and recommendations."}
                  </div>
                  <div className="grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Metabolic stability</span>
                      <span className="font-medium text-slate-900">{analysisReady ? "78%" : "--"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lifestyle alignment</span>
                      <span className="font-medium text-slate-900">{analysisReady ? "74%" : "--"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Monitoring cadence</span>
                      <span className="font-medium text-slate-900">{analysisReady ? "Weekly" : "--"}</span>
                    </div>
                  </div>
                  <ReportDownloadButton
                    title="Diabetes Risk Report"
                    filename="diabetes-risk-report.pdf"
                    lines={reportLines}
                    disabled={!analysisReady}
                    className="w-full rounded-full"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">Lifestyle recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Glucose logging</p>
                      <p>Record fasting glucose twice a week to tighten trend accuracy.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Update lab records</p>
                      <p>Upload your latest HbA1c report for more precise scoring.</p>
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
