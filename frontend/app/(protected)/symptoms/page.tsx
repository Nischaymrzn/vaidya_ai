"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import {
  createSymptom,
  deleteSymptom,
  getSymptoms,
  updateSymptom,
} from "@/lib/actions/symptoms-action";
import type { TSymptoms } from "@/lib/definition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SymptomForm, type SymptomPayload } from "./_components/symptom-form";
import { SymptomsHeader } from "./_components/symptoms-header";
import { SymptomsTable } from "./_components/symptoms-table";
import { SymptomsChartCard } from "./_components/symptoms-chart-card";
import { SymptomsAnomaliesCard } from "./_components/symptoms-anomalies-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const severityOptions = ["Mild", "Moderate", "Severe"];
const statusOptions = ["ongoing", "resolved", "unknown"];

export default function SymptomsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [symptoms, setSymptoms] = useState<TSymptoms[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<TSymptoms | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    setLoading(true);
    const result = await getSymptoms();
    if (result.success && result.data) {
      setSymptoms(result.data);
    }
    setLoading(false);
  };

  const handleCreate = (payload: SymptomPayload) => {
    startTransition(async () => {
      const result = await createSymptom(payload);
      if (!result.success) {
        toast.error(result.message || "Failed to add symptom");
        return;
      }
      toast.success("Symptom added successfully");
      setAddDialogOpen(false);
      loadSymptoms();
      router.refresh();
    });
  };

  const handleUpdate = (id: string, payload: SymptomPayload) => {
    startTransition(async () => {
      const result = await updateSymptom(id, payload);
      if (!result.success) {
        toast.error(result.message || "Failed to update symptom");
        return;
      }
      toast.success("Symptom updated successfully");
      setEditingSymptom(null);
      loadSymptoms();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteSymptom(id);
      if (!result.success) {
        toast.error(result.message || "Failed to delete symptom");
        return;
      }
      toast.success("Symptom deleted successfully");
      loadSymptoms();
      router.refresh();
    });
  };

  // Filter symptoms
  const filteredSymptoms = symptoms.filter((symptom) => {
    const matchesSearch =
      !searchTerm ||
      symptom.symptomList?.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      symptom.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === "All" || symptom.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  // Calculate stats
  const totalSymptoms = symptoms.length;
  const activeSymptoms = symptoms.filter(
    (s) => !s.status || s.status === "ongoing"
  ).length;
  const severeSymptoms = symptoms.filter((s) => s.severity === "Severe").length;

  // Get common symptoms
  const allSymptomsList = symptoms.flatMap((s) => s.symptomList || []);
  const symptomCounts = allSymptomsList.reduce((acc, symptom) => {
    acc[symptom] = (acc[symptom] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Prepare chart data
  const chartData = topSymptoms.map(([name, count]) => ({
    name,
    count,
  }));

  const PRIMARY = "#1F7AE0";

  const overviewStats = [
    {
      label: "Total logged",
      value: totalSymptoms.toString(),
      detail: "All time",
    },
    {
      label: "Ongoing",
      value: activeSymptoms.toString(),
      detail: "Active symptoms",
    },
    {
      label: "Severe",
      value: severeSymptoms.toString(),
      detail: "Marked severe",
    },
    {
      label: "Unique types",
      value: Object.keys(symptomCounts).length.toString(),
      detail: "Distinct symptoms",
    },
  ];

  const ongoingAlert = useMemo(() => {
    const ongoingItems = symptoms.filter((item) => item.status === "ongoing");
    if (!ongoingItems.length) return null;
    const sorted = [...ongoingItems].sort((a, b) => {
      const aDate = new Date(a.loggedAt ?? a.createdAt ?? a.updatedAt ?? 0).getTime();
      const bDate = new Date(b.loggedAt ?? b.createdAt ?? b.updatedAt ?? 0).getTime();
      return aDate - bDate;
    });
    const target = sorted[0];
    const dateValue = target.loggedAt ?? target.createdAt ?? target.updatedAt;
    if (!dateValue) return null;
    const daysAgo = Math.max(
      1,
      Math.floor((Date.now() - new Date(dateValue).getTime()) / 86400000),
    );
    const symptomLabel = target.symptomList?.[0] ?? "symptoms";
    return { daysAgo, symptomLabel };
  }, [symptoms]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <SymptomsHeader
            addDialogOpen={addDialogOpen}
            setAddDialogOpen={setAddDialogOpen}
            onCreate={handleCreate}
            isPending={isPending}
            severityOptions={severityOptions}
            statusOptions={statusOptions}
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
            <div className="min-w-0 space-y-4">
              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader className="space-y-0.5 pb-1.5">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Symptom snapshot
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    A quick overview of your tracked symptoms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-1">
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {overviewStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2.5"
                      >
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">
                          {stat.label}
                        </p>
                        <p className="mt-0.5 text-lg font-semibold text-slate-900">
                          {stat.value}
                        </p>
                        <p className="text-[11px] text-slate-500">{stat.detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    {totalSymptoms
                      ? "Keep entries consistent to improve symptom trend accuracy."
                      : "Start logging symptoms to build your trend history."}
                  </div>
                </CardContent>
              </Card>

              <SymptomsTable
                symptoms={symptoms}
                filteredSymptoms={filteredSymptoms}
                loading={loading}
                searchTerm={searchTerm}
                onSearchTermChange={(value) => setSearchTerm(value)}
                severityFilter={severityFilter}
                onSeverityFilterChange={(value) => setSeverityFilter(value)}
                severityOptions={severityOptions}
                onEdit={(symptom) => setEditingSymptom(symptom)}
                onDelete={(id) => handleDelete(id)}
              />
            </div>

            <div className="min-w-0 space-y-3">
              <SymptomsAnomaliesCard />
              <Card className="rounded-3xl border-slate-200/80 bg-white shadow-sm">
                <CardContent className="space-y-2.5 p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Feeling unsure?</p>
                      <p className="text-xs text-slate-500">
                        Chat with Vaidya.ai for gentle guidance.
                      </p>
                    </div>
                  </div>
                  {ongoingAlert ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      You logged <span className="font-semibold text-slate-900">{ongoingAlert.symptomLabel}</span>{" "}
                      {ongoingAlert.daysAgo} days ago and it is still marked ongoing. Update the status
                      to keep recovery tracking accurate.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      No ongoing symptoms flagged right now. Keep logging for clarity.
                    </div>
                  )}
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href="/ai-assistant">Talk to Vaidya.ai</Link>
                  </Button>
                </CardContent>
              </Card>

              <SymptomsChartCard
                data={chartData}
                primaryColor={PRIMARY}
                title="Most frequent symptoms"
                description="Top 5 symptom types from your logs"
                emptyMessage="No symptom trends yet"
                heightClassName="h-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSymptom} onOpenChange={(open) => !open && setEditingSymptom(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Symptom</DialogTitle>
            <DialogDescription>Update your symptom information</DialogDescription>
          </DialogHeader>
          {editingSymptom && (
            <SymptomForm
              key={editingSymptom._id}
              initial={editingSymptom}
              onSubmit={(payload) => handleUpdate(editingSymptom._id, payload)}
              submitLabel="Save Changes"
              busy={isPending}
              severityOptions={severityOptions}
              statusOptions={statusOptions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
