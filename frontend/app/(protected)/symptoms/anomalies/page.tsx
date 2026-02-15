"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PredictionCard = {
  title: string;
  priority: "High Priority" | "Low Priority";
  suggestions: number;
  score: number;
  color: string;
  initials: string;
};

const predictionCards: PredictionCard[] = [
  {
    title: "Lung Cancer",
    priority: "Low Priority",
    suggestions: 2,
    score: 38,
    color: "bg-[#1F7AE0]",
    initials: "LC",
  },
  {
    title: "Common Cold",
    priority: "High Priority",
    suggestions: 2,
    score: 74,
    color: "bg-rose-500",
    initials: "CC",
  },
  {
    title: "Bronchitis",
    priority: "High Priority",
    suggestions: 2,
    score: 62,
    color: "bg-emerald-500",
    initials: "BR",
  },
];

export default function HealthAnomaliesPage() {
  const [inputValue, setInputValue] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [analysisRequested, setAnalysisRequested] = useState(false);

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
  };

  const removeSymptom = (value: string) => {
    setSymptoms((prev) => prev.filter((item) => item !== value));
  };

  const handleAnalyze = () => {
    if (!symptoms.length) return;
    setAnalysisRequested(true);
  };

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
            <div className="relative mt-3">
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
            <p className="mt-2 text-xs text-slate-500">
              Add symptoms one by one to improve accuracy.
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
              disabled={!symptoms.length}
            >
              Analyze symptoms
            </Button>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">High Priority</h2>

            {analysisRequested && symptoms.length > 0 ? (
              <div className="space-y-3">
                {predictionCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}
                      >
                        <span className="text-sm font-semibold text-white">
                          {card.initials}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span>{card.priority}</span>
                          <span>•</span>
                          <span>{card.suggestions} Suggestions</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full ${card.color}`}
                            style={{ width: `${card.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Add symptoms above and tap “Analyze symptoms” to see possible conditions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
