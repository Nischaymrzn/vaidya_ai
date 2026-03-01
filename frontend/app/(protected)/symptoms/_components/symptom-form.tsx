"use client";

import { useState } from "react";
import type { TSymptoms } from "@/lib/definition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SymptomFormState = {
  symptomList: string;
  severity: string;
  status: string;
  durationDays: string;
  diagnosis: string;
  disease: string;
  notes: string;
  loggedAt: string;
};

export type SymptomPayload = {
  symptomList: string[];
  severity?: string;
  status?: string;
  durationDays?: number;
  diagnosis?: string;
  disease?: string;
  notes?: string;
  loggedAt?: string;
};

const buildInitialForm = (symptom?: TSymptoms | null): SymptomFormState => ({
  symptomList: symptom?.symptomList?.join(", ") ?? "",
  severity: symptom?.severity ?? "",
  status: symptom?.status ?? "ongoing",
  durationDays: symptom?.durationDays?.toString() ?? "",
  diagnosis: symptom?.diagnosis ?? "",
  disease: symptom?.disease ?? "",
  notes: symptom?.notes ?? "",
  loggedAt: symptom?.loggedAt
    ? new Date(symptom.loggedAt).toISOString().slice(0, 16)
    : "",
});

const toPayload = (state: SymptomFormState): SymptomPayload => {
  const loggedAt = state.loggedAt ? new Date(state.loggedAt).toISOString() : undefined;
  const durationDays = state.durationDays ? parseInt(state.durationDays, 10) : undefined;

  return {
    symptomList: state.symptomList
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    severity: state.severity || undefined,
    status: state.status || undefined,
    durationDays,
    diagnosis: state.diagnosis || undefined,
    disease: state.disease || undefined,
    notes: state.notes || undefined,
    loggedAt,
  };
};

type SymptomFormProps = {
  initial?: TSymptoms | null;
  onSubmit: (payload: SymptomPayload) => void;
  submitLabel: string;
  busy?: boolean;
  severityOptions: string[];
  statusOptions: string[];
};

export function SymptomForm({
  initial,
  onSubmit,
  submitLabel,
  busy,
  severityOptions,
  statusOptions,
}: SymptomFormProps) {
  const [state, setState] = useState<SymptomFormState>(() => buildInitialForm(initial));

  const handleChange = (field: keyof SymptomFormState, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(toPayload(state));
      }}
    >
      <div className="grid gap-4">
        <div>
          <Label className="text-sm font-medium text-foreground">Symptoms</Label>
          <Textarea
            value={state.symptomList}
            onChange={(e) => handleChange("symptomList", e.target.value)}
            placeholder="e.g., Headache, Fever, Cough (comma separated)"
            className="mt-1.5 min-h-[80px]"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Separate multiple symptoms with commas
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-sm font-medium text-foreground">Severity</Label>
            <Select value={state.severity} onValueChange={(val) => handleChange("severity", val)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground">Status</Label>
            <Select value={state.status} onValueChange={(val) => handleChange("status", val)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground">Duration (days)</Label>
            <Input
              type="number"
              value={state.durationDays}
              onChange={(e) => handleChange("durationDays", e.target.value)}
              placeholder="e.g., 3"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground">When did it start?</Label>
            <Input
              type="datetime-local"
              value={state.loggedAt}
              onChange={(e) => handleChange("loggedAt", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground">Notes (optional)</Label>
          <Textarea
            value={state.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Triggers, context, or additional details..."
            className="mt-1.5 min-h-[60px]"
          />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full bg-[#1F7AE0]" disabled={busy}>
        {busy ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
