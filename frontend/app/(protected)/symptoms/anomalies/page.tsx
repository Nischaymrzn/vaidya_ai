"use client";

import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { predictDisease } from "@/lib/actions/prediction-action";
import type { TPredictionFinal, TPredictionResponse } from "@/lib/definition";

const MIN_SYMPTOMS = 1;

const normalizeSymptomForPrediction = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

const toPredictionPayload = (items: string[]) =>
  Array.from(
    new Set(items.map((item) => normalizeSymptomForPrediction(item)).filter(Boolean)),
  );

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "NA";

const getPriority = (score: number) => (score >= 60 ? "High Priority" : "Low Priority");

const getColor = (score: number) => {
  if (score >= 70) return "bg-rose-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-emerald-500";
};

export default function HealthAnomaliesPage() {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [analysisRequested, setAnalysisRequested] = useState(false);
  const [prediction, setPrediction] = useState<TPredictionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetAnalysis = () => {
    setAnalysisRequested(false);
    setPrediction(null);
    setErrorMessage(null);
  };

  const addSymptom = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSymptoms((prev) => {
      if (prev.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [...prev, trimmed];
    });
    setInputValue("");
    resetAnalysis();
  };

  const removeSymptom = (value: string) => {
    setSymptoms((prev) => prev.filter((item) => item !== value));
    resetAnalysis();
  };

  const handleAnalyze = () => {
    const normalizedSymptoms = toPredictionPayload(symptoms);
    if (normalizedSymptoms.length < MIN_SYMPTOMS) {
      const label = MIN_SYMPTOMS === 1 ? "symptom" : "symptoms";
      setAnalysisRequested(true);
      setPrediction(null);
      setErrorMessage(`Please add at least ${MIN_SYMPTOMS} ${label} to analyze.`);
      return;
    }

    setAnalysisRequested(true);
    setErrorMessage(null);
    startTransition(async () => {
      const result = await predictDisease(normalizedSymptoms);
      if (!result.success || !result.data) {
        setPrediction(null);
        setErrorMessage(result.message || "Unable to analyze symptoms right now.");
        return;
      }
      setPrediction(result.data);
    });
  };

  const predictionCards = prediction?.finalTop3 ?? [];
  const summary = prediction?.analysisSummary ?? "";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Health Anomalies
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your symptoms, and our AI will suggest possible health conditions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Symptoms
            </label>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      addSymptom(inputValue);
                    }
                  }}
                  onBlur={() => addSymptom(inputValue)}
                  placeholder="Breathlessness"
                  className="h-11 rounded-xl border-slate-200 pl-9 text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-700"
                onClick={() => addSymptom(inputValue)}
                disabled={!inputValue.trim()}
              >
                Add
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Add at least {MIN_SYMPTOMS} {MIN_SYMPTOMS === 1 ? "symptom" : "symptoms"} to
              improve accuracy.
            </p>

            {symptoms.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <span
                    key={symptom}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() => removeSymptom(symptom)}
                      className="text-slate-400 transition hover:text-slate-600"
                      aria-label={`Remove ${symptom}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <Button
              className="mt-4 w-full rounded-xl bg-[#1F7AE0] text-sm font-semibold"
              onClick={handleAnalyze}
              disabled={symptoms.length < MIN_SYMPTOMS || isPending}
            >
              {isPending ? "Analyzing..." : "Analyze symptoms"}
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Results</h2>

            {analysisRequested ? (
              <div className="space-y-3">
                {isPending ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    Analyzing your symptoms...
                  </div>
                ) : errorMessage ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
                    {errorMessage}
                  </div>
                ) : predictionCards.length > 0 ? (
                  <>
                    {summary ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Summary
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{summary}</p>
                      </div>
                    ) : null}

                    {predictionCards.map((card: TPredictionFinal) => {
                      const score = Math.max(0, Math.min(100, card.probability));
                      const priority = getPriority(score);
                      const color = getColor(score);
                      return (
                        <div
                          key={card.disease}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                            >
                              <span className="text-sm font-semibold text-white">
                                {getInitials(card.disease)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">
                                {card.disease}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <span>{priority}</span>
                                <span>|</span>
                                <span>{score}% confidence</span>
                              </div>
                              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
                              </div>
                              <p className="mt-2 text-xs text-slate-500">
                                {card.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    No predictions available yet. Please try again.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Add symptoms above and tap "Analyze symptoms" to see possible conditions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
