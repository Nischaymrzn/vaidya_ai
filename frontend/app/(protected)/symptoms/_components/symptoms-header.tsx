"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { SymptomForm, type SymptomPayload } from "./symptom-form";

type SymptomsHeaderProps = {
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  onCreate: (payload: SymptomPayload) => void;
  isPending: boolean;
  severityOptions: string[];
};

export function SymptomsHeader({
  addDialogOpen,
  setAddDialogOpen,
  onCreate,
  isPending,
  severityOptions,
}: SymptomsHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Symptom Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Log symptoms, identify patterns, and get AI-powered health insights
        </p>
      </div>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full bg-[#1F7AE0]">
            <Plus className="h-4 w-4" />
            Log Symptom
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Log New Symptom</DialogTitle>
            <DialogDescription>
              Track your symptoms to identify patterns and get insights
            </DialogDescription>
          </DialogHeader>
          <SymptomForm
            key="new"
            onSubmit={onCreate}
            submitLabel="Save Symptom"
            busy={isPending}
            severityOptions={severityOptions}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
