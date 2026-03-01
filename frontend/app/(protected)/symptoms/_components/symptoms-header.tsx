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
  statusOptions: string[];
};

export function SymptomsHeader({
  addDialogOpen,
  setAddDialogOpen,
  onCreate,
  isPending,
  severityOptions,
  statusOptions,
}: SymptomsHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Symptom Tracker
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Log symptoms, spot patterns, and keep your care timeline current.
        </p>
      </div>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Log symptom
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
            statusOptions={statusOptions}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
