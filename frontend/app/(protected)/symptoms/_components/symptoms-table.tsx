"use client";

import { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import type { TSymptoms } from "@/lib/definition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Calendar,
  Clock,
  Edit,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";

type SymptomsTableProps = {
  symptoms: TSymptoms[];
  filteredSymptoms: TSymptoms[];
  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
  severityOptions: string[];
  onEdit: (symptom: TSymptoms) => void;
  onDelete: (id: string) => void;
};

const formatStatus = (status?: string) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getSeverityTone = (severity?: string) => {
  switch (severity) {
    case "Severe":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
    case "Moderate":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
    case "Mild":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function SymptomsTable({
  symptoms,
  filteredSymptoms,
  loading,
  searchTerm,
  onSearchTermChange,
  severityFilter,
  onSeverityFilterChange,
  severityOptions,
  onEdit,
  onDelete,
}: SymptomsTableProps) {
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredSymptoms.length / pageSize));
  const paginatedSymptoms = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSymptoms.slice(start, start + pageSize);
  }, [filteredSymptoms, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, severityFilter, filteredSymptoms.length]);

  return (
    <Card className="w-full rounded-3xl border border-border bg-card shadow-sm">
      <CardHeader className="space-y-1.5 border-b border-border pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Symptom history
            </CardTitle>
            <CardDescription className="mt-0.5 text-sm text-muted-foreground">
              {filteredSymptoms.length} of {symptoms.length} records
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              className="h-6 w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              placeholder="Search by symptom or note..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>
          <Select value={severityFilter} onValueChange={onSeverityFilterChange}>
            <SelectTrigger className="h-8 w-36 rounded-full border-border bg-muted/40">
              <Filter className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All severity</SelectItem>
              {severityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Loading symptoms...
          </div>
        ) : filteredSymptoms.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/30">
                    <TableHead className="w-[40%] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Symptoms
                    </TableHead>
                    <TableHead className="w-[12%] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Severity
                    </TableHead>
                    <TableHead className="w-[12%] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-[12%] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Duration
                    </TableHead>
                    <TableHead className="w-[14%] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Logged
                    </TableHead>
                    <TableHead className="w-[10%] text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSymptoms.map((symptom) => (
                    <TableRow
                      key={symptom._id}
                      className="border-b border-border hover:bg-muted/30"
                    >
                      <TableCell className="whitespace-normal text-sm text-foreground">
                        {symptom.symptomList?.length
                          ? symptom.symptomList.join(", ")
                          : "-"}
                        {symptom.notes && (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {symptom.notes.length > 60
                              ? symptom.notes.slice(0, 60) + "..."
                              : symptom.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {symptom.severity ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getSeverityTone(symptom.severity)}`}
                          >
                            {symptom.severity}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {symptom.status ? formatStatus(symptom.status) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {symptom.durationDays ? `${symptom.durationDays} days` : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {symptom.loggedAt
                          ? formatDistanceToNow(new Date(symptom.loggedAt), {
                              addSuffix: true,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEdit(symptom)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-rose-600"
                                  onSelect={(event) => event.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this symptom?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently remove this
                                    symptom entry.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-rose-600 hover:bg-rose-700"
                                    onClick={() => onDelete(symptom._id)}
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

            <div className="space-y-3 md:hidden">
              {paginatedSymptoms.map((symptom) => (
                <div
                  key={symptom._id}
                  className="rounded-2xl border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {symptom.symptomList?.length
                          ? symptom.symptomList.join(", ")
                          : "-"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Severity:{" "}
                        {symptom.severity ? (
                          <span
                            className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getSeverityTone(symptom.severity)}`}
                          >
                            {symptom.severity}
                          </span>
                        ) : (
                          "-"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {symptom.status ? formatStatus(symptom.status) : "-"}
                      </p>
                      {symptom.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{symptom.notes}</p>
                      )}
                      <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                        {symptom.durationDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {symptom.durationDays}d
                          </span>
                        )}
                        {symptom.loggedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(symptom.loggedAt), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEdit(symptom)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-rose-600"
                              onSelect={(event) => event.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this symptom?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-rose-600 hover:bg-rose-700"
                                onClick={() => onDelete(symptom._id)}
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

            {totalPages > 1 ? (
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full border-border px-3 text-foreground"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full border-border px-3 text-foreground"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
            <Activity className="h-11 w-11 text-muted-foreground/60" />
            <p className="mt-3 text-base font-medium text-foreground">
              No symptoms logged yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking by clicking "Log Symptom" above
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
