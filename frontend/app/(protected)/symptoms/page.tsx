"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { StatGrid } from "@/components/ui/stat-grid";
import { toast } from "sonner";
import { SymptomForm, type SymptomPayload } from "./_components/symptom-form";
import { SymptomsHeader } from "./_components/symptoms-header";
import { SymptomsTable } from "./_components/symptoms-table";
import { SymptomsChartCard } from "./_components/symptoms-chart-card";
import { SymptomsAnomaliesCard } from "./_components/symptoms-anomalies-card";

const severityOptions = ["Mild", "Moderate", "Severe"];

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
    (s) =>
      s.loggedAt &&
      new Date(s.loggedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
    .slice(0, 6);

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
      label: "This week",
      value: activeSymptoms.toString(),
      detail: "Last 7 days",
    },
    {
      label: "Severe",
      value: severeSymptoms.toString(),
      detail: "Marked severe",
    },
    {
      label: "Unique types",
      value: topSymptoms.length.toString(),
      detail: "Distinct symptoms",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <SymptomsHeader
            addDialogOpen={addDialogOpen}
            setAddDialogOpen={setAddDialogOpen}
            onCreate={handleCreate}
            isPending={isPending}
            severityOptions={severityOptions}
          />

          <StatGrid items={overviewStats} columns={4} />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-5">
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

            <div className="space-y-5">
              <SymptomsChartCard data={chartData} primaryColor={PRIMARY} />
              <SymptomsAnomaliesCard />
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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
