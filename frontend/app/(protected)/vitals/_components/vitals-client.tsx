"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { AlertTriangle, MoreHorizontal } from "lucide-react";
import { createVitals, deleteVitals, updateVitals } from "@/lib/actions/vitals-action";
import type { TVitals, VitalsSummary, VitalsSummaryCard, VitalsTrendPoint } from "@/lib/definition";
import { VitalsTrendCard } from "./vitals-trend-card";

type VitalsClientProps = {
  summary: VitalsSummary | null;
  error?: string | null;
};

type VitalFormState = {
  systolicBp: string;
  diastolicBp: string;
  heartRate: string;
  glucoseLevel: string;
  weight: string;
  height: string;
  bmi: string;
  recordedAt: string;
  notes: string;
};

const statusStyles: Record<string, string> = {
  Normal: "bg-emerald-50 text-emerald-700",
  Elevated: "bg-amber-50 text-amber-700",
  Borderline: "bg-amber-50 text-amber-700",
  High: "bg-rose-50 text-rose-700",
  Low: "bg-sky-50 text-sky-700",
  "No data": "bg-slate-100 text-slate-500",
};

const insightCopy: Record<string, { tone: string; message: string; title: string }> = {
  Normal: {
    tone: "bg-emerald-50 text-emerald-700",
    title: "Optimal",
    message: "Within your typical range. Keep a steady routine.",
  },
  Elevated: {
    tone: "bg-amber-50 text-amber-700",
    title: "Slightly elevated",
    message: "Consider light activity and hydration. Re-check in a few hours.",
  },
  Borderline: {
    tone: "bg-amber-50 text-amber-700",
    title: "Borderline",
    message: "Near the upper range. Recheck soon and log symptoms.",
  },
  High: {
    tone: "bg-rose-50 text-rose-700",
    title: "High",
    message: "Above range. Recheck and note symptoms.",
  },
  Low: {
    tone: "bg-sky-50 text-sky-700",
    title: "Low",
    message: "Below range. Recheck and rest.",
  },
  "No data": {
    tone: "bg-slate-100 text-slate-500",
    title: "No data",
    message: "Add a reading to see insights.",
  },
};

const insightPercentByStatus: Record<string, number> = {
  Normal: 78,
  Elevated: 64,
  Borderline: 55,
  High: 40,
  Low: 45,
  "No data": 0,
};

const insightLabelByStatus: Record<string, string> = {
  Normal: "OPTIMAL",
  Elevated: "SLIGHTLY HIGH",
  Borderline: "BORDERLINE",
  High: "HIGH",
  Low: "LOW",
  "No data": "NO DATA",
};

const riskPriority: Record<string, number> = {
  High: 4,
  Elevated: 3,
  Borderline: 3,
  Low: 2,
  Normal: 1,
  "No data": 0,
};

const insightLineColor = "#1F7AE0";

const buildInitialForm = (vital?: TVitals | null): VitalFormState => ({
  systolicBp: vital?.systolicBp?.toString() ?? "",
  diastolicBp: vital?.diastolicBp?.toString() ?? "",
  heartRate: vital?.heartRate?.toString() ?? "",
  glucoseLevel: vital?.glucoseLevel?.toString() ?? "",
  weight: vital?.weight?.toString() ?? "",
  height: vital?.height?.toString() ?? "",
  bmi: vital?.bmi?.toString() ?? "",
  recordedAt: vital?.recordedAt
    ? new Date(vital.recordedAt).toISOString().slice(0, 16)
    : "",
  notes: vital?.notes ?? "",
});

const parseNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toPayload = (state: VitalFormState) => {
  const recordedAt = state.recordedAt
    ? new Date(state.recordedAt).toISOString()
    : undefined;

  return {
    systolicBp: parseNumber(state.systolicBp),
    diastolicBp: parseNumber(state.diastolicBp),
    heartRate: parseNumber(state.heartRate),
    glucoseLevel: parseNumber(state.glucoseLevel),
    weight: parseNumber(state.weight),
    height: parseNumber(state.height),
    bmi: parseNumber(state.bmi),
    recordedAt,
    notes: state.notes?.trim() || undefined,
  };
};

const formatUpdated = (value?: string | null) => {
  if (!value) return "No update yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No update yet";
  return `Updated ${formatDistanceToNow(date, { addSuffix: true })}`;
};

function HeartValueTag({
  label,
  value,
  unit,
  side = "left",
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      className={`absolute min-w-[140px] rounded-xl bg-white/95 px-4 py-2.5 text-xs shadow-sm ring-1 ring-slate-200/70 backdrop-blur ${
        side === "right" ? "text-right" : ""
      } ${className ?? ""}`}
    >
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">
        {value}
        {unit ? <span className="ml-1 text-[11px] font-medium text-slate-500">{unit}</span> : null}
      </p>
    </div>
  );
}

function VitalsForm({
  initial,
  onSubmit,
  submitLabel,
  busy,
}: {
  initial?: TVitals | null;
  onSubmit: (payload: ReturnType<typeof toPayload>) => void;
  submitLabel: string;
  busy?: boolean;
}) {
  const [state, setState] = useState<VitalFormState>(() => buildInitialForm(initial));

  const handleChange = (field: keyof VitalFormState, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(toPayload(state));
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">Heart Rate (bpm)</label>
          <Input
            value={state.heartRate}
            onChange={(event) => handleChange("heartRate", event.target.value)}
            placeholder="72"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Glucose (mg/dL)</label>
          <Input
            value={state.glucoseLevel}
            onChange={(event) => handleChange("glucoseLevel", event.target.value)}
            placeholder="95"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Systolic BP (mmHg)</label>
          <Input
            value={state.systolicBp}
            onChange={(event) => handleChange("systolicBp", event.target.value)}
            placeholder="120"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Diastolic BP (mmHg)</label>
          <Input
            value={state.diastolicBp}
            onChange={(event) => handleChange("diastolicBp", event.target.value)}
            placeholder="78"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Weight (kg)</label>
          <Input
            value={state.weight}
            onChange={(event) => handleChange("weight", event.target.value)}
            placeholder="65"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Height (cm)</label>
          <Input
            value={state.height}
            onChange={(event) => handleChange("height", event.target.value)}
            placeholder="170"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">BMI</label>
          <Input
            value={state.bmi}
            onChange={(event) => handleChange("bmi", event.target.value)}
            placeholder="22.5"
            inputMode="decimal"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Recorded At</label>
          <Input
            type="datetime-local"
            value={state.recordedAt}
            onChange={(event) => handleChange("recordedAt", event.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Notes</label>
        <Input
          value={state.notes}
          onChange={(event) => handleChange("notes", event.target.value)}
          placeholder="Optional notes"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function InsightCard({ card, trend }: { card?: VitalsSummaryCard; trend: VitalsTrendPoint[] }) {
  const status = card?.status ?? "No data";
  const statusClass = statusStyles[status] ?? statusStyles["No data"];
  const copy = insightCopy[status] ?? insightCopy["No data"];
  const delta = card?.delta?.trim();
  const percent = insightPercentByStatus[status] ?? 0;
  const percentLabel = insightLabelByStatus[status] ?? "STATUS";
  const PRIMARY = "#1F7AE0";
  const ringStyle = {
    background: `conic-gradient(${PRIMARY} ${percent * 3.6}deg, #e5e7eb 0deg)`,
  };
  const dataKey =
    card?.key === "bloodPressure"
      ? "systolic"
      : card?.key === "glucose"
        ? "glucose"
        : "heartRate";
  const chartData = trend.map((point) => ({
    label: point.label,
    value: point[dataKey],
  }));

  return (
    <Card className="h-full rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-slate-900">Vital Insights</p>
            <p className="text-sm text-slate-500">
              Major risk: {card?.label ?? "No data"}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold text-slate-900">
            {card?.value ?? "--"}
            {card?.unit ? <span className="ml-1 text-sm text-slate-500">{card.unit}</span> : null}
          </div>
          <p className="text-sm text-slate-500">{formatUpdated(card?.updatedAt)}</p>
        </div>

        <div className="flex items-center justify-center py-2">
          <div className="relative h-36 w-36 rounded-full p-2.5" style={ringStyle}>
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
              <p className="text-2xl font-semibold text-slate-900">{percent}%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{percentLabel}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border px-3 py-2.5 text-xs ${copy.tone}`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">{copy.title}</p>
              <p className="mt-0.5 text-sm">{copy.message}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">History</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3">
            <ChartContainer
              className="h-24 w-full"
              config={{ value: { label: card?.label ?? "Vital", color: insightLineColor } }}
            >
              <AreaChart data={chartData} margin={{ left: -6, right: 6, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="insightLineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickMargin={8}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={PRIMARY}
                  fill="url(#insightLineGradient)"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Change: {delta || "—"}</span>
          <span>Based on latest entry</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function VitalsClient({ summary, error }: VitalsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [logPage, setLogPage] = useState(1);

  const cards = summary?.cards ?? [];
  const records = useMemo(() => {
    const items = [...(summary?.records ?? [])];
    return items.sort((a, b) => {
      const aDate = new Date(a.recordedAt ?? a.createdAt ?? 0).getTime();
      const bDate = new Date(b.recordedAt ?? b.createdAt ?? 0).getTime();
      return bDate - aDate;
    });
  }, [summary?.records]);
  const recordsPerPage = 7;
  const totalPages = Math.max(1, Math.ceil(records.length / recordsPerPage));
  const paginatedRecords = useMemo(() => {
    const start = (logPage - 1) * recordsPerPage;
    return records.slice(start, start + recordsPerPage);
  }, [logPage, records]);

  useEffect(() => {
    if (logPage > totalPages) {
      setLogPage(totalPages);
    }
  }, [logPage, totalPages]);
  const trend = summary?.trend ?? [];

  const heartCard = cards.find((card) => card.key === "heartRate");
  const bpCard = cards.find((card) => card.key === "bloodPressure");
  const glucoseCard = cards.find((card) => card.key === "glucose");
  const bloodCountValue = "79";
  const highRiskCard = useMemo(() => {
    const candidates = cards.filter((card) =>
      ["heartRate", "bloodPressure", "glucose"].includes(card.key),
    );
    if (!candidates.length) return undefined;
    return candidates.reduce<VitalsSummaryCard | undefined>((best, current) => {
      if (!best) return current;
      const bestScore = riskPriority[best.status] ?? 0;
      const currentScore = riskPriority[current.status] ?? 0;
      return currentScore > bestScore ? current : best;
    }, candidates[0]);
  }, [cards]);
  const trendStats = useMemo(() => {
    const buildNote = (delta?: string | null) => delta?.trim() || "No recent change";
    return [
      {
        label: "Heart Rate",
        value: heartCard?.value && heartCard.value !== "N/A"
          ? `${heartCard.value} ${heartCard.unit ?? "bpm"}`
          : "--",
        note: buildNote(heartCard?.delta),
      },
      {
        label: "Blood Pressure",
        value: bpCard?.value && bpCard.value !== "N/A" ? bpCard.value : "--",
        note: buildNote(bpCard?.delta),
      },
      {
        label: "Glucose",
        value: glucoseCard?.value && glucoseCard.value !== "N/A"
          ? `${glucoseCard.value} ${glucoseCard.unit ?? "mg/dL"}`
          : "--",
        note: buildNote(glucoseCard?.delta),
      },
    ];
  }, [heartCard, bpCard, glucoseCard]);

  const handleCreate = (payload: ReturnType<typeof toPayload>) => {
    startTransition(async () => {
      const result = await createVitals(payload);
      if (!result.success) {
        toast.error(result.message || "Failed to add vitals");
        return;
      }
      toast.success("Vitals added");
      router.refresh();
    });
  };

  const handleUpdate = (id: string, payload: ReturnType<typeof toPayload>) => {
    startTransition(async () => {
      const result = await updateVitals(id, payload);
      if (!result.success) {
        toast.error(result.message || "Failed to update vitals");
        return;
      }
      toast.success("Vitals updated");
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteVitals(id);
      if (!result.success) {
        toast.error(result.message || "Failed to delete vitals");
        return;
      }
      toast.success("Vitals deleted");
      router.refresh();
    });
  };

  const calloutValues = useMemo(
    () => ({
      heartRate: heartCard?.value && heartCard.value !== "N/A" ? heartCard.value : "--",
      bloodPressure: bpCard?.value && bpCard.value !== "N/A" ? bpCard.value : "--",
      glucose: glucoseCard?.value && glucoseCard.value !== "N/A" ? glucoseCard.value : "--",
      bloodCount: bloodCountValue,
    }),
    [bpCard, heartCard, glucoseCard, bloodCountValue],
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Vitals</h1>
              <p className="text-sm text-slate-500">
                Track your vitals over time with clear trends and fast logging.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full">Add reading</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a new vitals reading</DialogTitle>
                </DialogHeader>
                <VitalsForm
                  key="new"
                  onSubmit={handleCreate}
                  submitLabel="Save reading"
                  busy={isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {error ? (
            <Card className="border-rose-200 bg-rose-50/60">
              <CardContent className="py-4 text-sm text-rose-700">
                {error}
              </CardContent>
            </Card>
          ) : null}


          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">Cardiac Mapping</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  A quick visual of your latest readings.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 px-3 py-3 sm:px-4">
                  <div className="relative mx-auto h-52 w-full max-w-[520px] sm:h-64">
                    <img
                      src="/heart.svg"
                      alt="Heart overview"
                      className="h-full w-full object-contain"
                    />
                    <HeartValueTag
                      label="Glucose Level"
                      value={calloutValues.glucose}
                      unit="mg/dL"
                      className="left-[4%] top-[14%]"
                    />
                    <HeartValueTag
                      label="Heart Rate"
                      value={calloutValues.heartRate}
                      unit="bpm"
                      className="left-[4%] top-[70%]"
                    />
                    <HeartValueTag
                      label="Blood Count"
                      value={calloutValues.bloodCount}
                      unit="%"
                      side="right"
                      className="right-[4%] top-[14%]"
                    />
                    <HeartValueTag
                      label="Blood Pressure"
                      value={calloutValues.bloodPressure}
                      unit="mmHg"
                      side="right"
                      className="right-[4%] top-[68%]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <VitalsTrendCard data={trend} stats={trendStats} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
            <div className="h-full">
              <Card className="h-full rounded-2xl border-slate-200/80 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900">Vitals Log</CardTitle>
                      <CardDescription className="text-sm text-slate-500">
                        Latest entries first. Edit or remove any row.
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="rounded-full">
                          Add entry
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add a new vitals reading</DialogTitle>
                        </DialogHeader>
                        <VitalsForm
                          key="new-inline"
                          onSubmit={handleCreate}
                          submitLabel="Save reading"
                          busy={isPending}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-3">
              {records.length ? (
                <div className="flex-1">
                  <div className="hidden md:block">
                    <div className="rounded-2xl border border-slate-200/70">
                      <Table className="table-fixed">
                        <TableHeader>
                          <TableRow className="border-b border-slate-200 bg-slate-50/50">
                            <TableHead className="w-[110px] text-xs font-medium uppercase tracking-wider text-slate-500">
                              Date
                            </TableHead>
                            <TableHead className="w-[70px] text-xs font-medium uppercase tracking-wider text-slate-500">
                              Heart
                            </TableHead>
                            <TableHead className="w-[110px] text-xs font-medium uppercase tracking-wider text-slate-500">
                              BP
                            </TableHead>
                            <TableHead className="w-[110px] text-xs font-medium uppercase tracking-wider text-slate-500">
                              Glucose
                            </TableHead>
                            <TableHead className="w-[90px] text-xs font-medium uppercase tracking-wider text-slate-500">
                              Weight
                            </TableHead>
                            <TableHead className="w-[80px] text-xs font-medium uppercase tracking-wider text-slate-500">
                              BMI
                            </TableHead>
                            <TableHead className="w-[90px] text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedRecords.map((record) => (
                            <TableRow key={record._id} className="border-b border-slate-200 hover:bg-slate-50/50">
                              <TableCell className="text-sm text-slate-600">
                                {record.recordedAt || record.createdAt
                                  ? new Date(record.recordedAt ?? record.createdAt ?? "").toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )
                                  : "--"}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {record.heartRate ?? "--"}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {record.systolicBp ?? "--"}/{record.diastolicBp ?? "--"}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {record.glucoseLevel ?? "--"}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {record.weight ?? "--"}
                              </TableCell>
                              <TableCell className="text-sm text-slate-900">
                                {record.bmi ?? "--"}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-slate-500"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <DropdownMenuItem>View</DropdownMenuItem>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Vitals details</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-2 text-sm text-slate-700">
                                          <div>Heart Rate: {record.heartRate ?? "--"} bpm</div>
                                          <div>
                                            Blood Pressure: {record.systolicBp ?? "--"}/{record.diastolicBp ?? "--"} mmHg
                                          </div>
                                          <div>Glucose: {record.glucoseLevel ?? "--"} mg/dL</div>
                                          <div>Weight: {record.weight ?? "--"} kg</div>
                                          <div>BMI: {record.bmi ?? "--"}</div>
                                          <div>Notes: {record.notes ?? "--"}</div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Edit vitals entry</DialogTitle>
                                        </DialogHeader>
                                        <VitalsForm
                                          key={record._id ?? "edit"}
                                          initial={record}
                                          onSubmit={(payload) => {
                                            if (record._id) handleUpdate(record._id, payload);
                                          }}
                                          submitLabel="Save changes"
                                          busy={isPending}
                                        />
                                      </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-rose-600">
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will remove the vitals reading permanently.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-rose-600 hover:bg-rose-700"
                                            onClick={() => record._id && handleDelete(record._id)}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="grid gap-3 md:hidden">
                    {paginatedRecords.map((record) => (
                      <div key={record._id} className="rounded-2xl border border-slate-200/70 p-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {record.recordedAt || record.createdAt
                              ? new Date(record.recordedAt ?? record.createdAt ?? "").toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "--"}
                          </span>
                          <span>
                            {record.systolicBp ?? "--"}/{record.diastolicBp ?? "--"} mmHg
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700">
                          <div>HR: {record.heartRate ?? "--"} bpm</div>
                          <div>Glucose: {record.glucoseLevel ?? "--"} mg/dL</div>
                          <div>Weight: {record.weight ?? "--"} kg</div>
                          <div>BMI: {record.bmi ?? "--"}</div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem>View</DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Vitals details</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-2 text-sm text-slate-700">
                                    <div>Heart Rate: {record.heartRate ?? "--"} bpm</div>
                                    <div>
                                      Blood Pressure: {record.systolicBp ?? "--"}/{record.diastolicBp ?? "--"} mmHg
                                    </div>
                                    <div>Glucose: {record.glucoseLevel ?? "--"} mg/dL</div>
                                    <div>Weight: {record.weight ?? "--"} kg</div>
                                    <div>BMI: {record.bmi ?? "--"}</div>
                                    <div>Notes: {record.notes ?? "--"}</div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit vitals entry</DialogTitle>
                                  </DialogHeader>
                                  <VitalsForm
                                    key={record._id ?? "edit-mobile"}
                                    initial={record}
                                    onSubmit={(payload) => {
                                      if (record._id) handleUpdate(record._id, payload);
                                    }}
                                    submitLabel="Save changes"
                                    busy={isPending}
                                  />
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-rose-600">
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove the vitals reading permanently.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-rose-600 hover:bg-rose-700"
                                      onClick={() => record._id && handleDelete(record._id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-sm text-slate-500">
                  No vitals recorded yet. Add your first reading to see trends.
                </div>
              )}
                {totalPages > 1 ? (
                  <div className="mt-auto flex items-center justify-between border-t border-slate-200 px-4 py-3.5 text-sm text-slate-500">
                    <span>
                      Page {logPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={logPage === 1}
                        onClick={() => setLogPage((prev) => Math.max(1, prev - 1))}
                      >
                        Prev
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={logPage === totalPages}
                        onClick={() => setLogPage((prev) => Math.min(totalPages, prev + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
                </CardContent>
              </Card>
            </div>
            <aside className="h-full space-y-4">
              <InsightCard card={highRiskCard} trend={trend} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
