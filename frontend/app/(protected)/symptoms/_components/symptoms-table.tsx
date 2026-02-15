"use client";

import { format, formatDistanceToNow } from "date-fns";
import type { TSymptoms } from "@/lib/definition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case "Severe":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "Moderate":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Mild":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
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
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardHeader className="space-y-0.5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Symptom History
            </CardTitle>
            <CardDescription className="mt-0.5 text-sm text-slate-500">
              {filteredSymptoms.length} of {symptoms.length} symptoms
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                className="h-6 w-32 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 sm:w-48"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={onSeverityFilterChange}>
              <SelectTrigger className="h-9 w-32 rounded-full">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Severity</SelectItem>
                {severityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">
            Loading symptoms...
          </div>
        ) : filteredSymptoms.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/50">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Symptoms
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Severity
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Duration
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Logged
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSymptoms.map((symptom) => (
                    <TableRow
                      key={symptom._id}
                      className="border-b border-slate-200 hover:bg-slate-50/50"
                    >
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {symptom.symptomList?.map((s, i) => (
                            <Badge
                              key={`${s}-${i}`}
                              className="bg-[#1F7AE0]/10 text-[#1F7AE0]"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                        {symptom.notes && (
                          <p className="mt-1.5 text-xs text-slate-500">
                            {symptom.notes.length > 60
                              ? symptom.notes.slice(0, 60) + "..."
                              : symptom.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {symptom.severity ? (
                          <Badge variant="outline" className={getSeverityColor(symptom.severity)}>
                            {symptom.severity}
                          </Badge>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {symptom.durationDays ? `${symptom.durationDays} days` : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
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
              {filteredSymptoms.map((symptom) => (
                <div
                  key={symptom._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1.5">
                        {symptom.symptomList?.map((s, i) => (
                          <Badge key={`${s}-${i}`} className="bg-[#1F7AE0]/10 text-[#1F7AE0]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      {symptom.severity && (
                        <Badge
                          variant="outline"
                          className={`mt-2 ${getSeverityColor(symptom.severity)}`}
                        >
                          {symptom.severity}
                        </Badge>
                      )}
                      {symptom.notes && (
                        <p className="mt-2 text-sm text-slate-600">{symptom.notes}</p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
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
          </>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <Activity className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-base font-medium text-slate-900">
              No symptoms logged yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Start tracking by clicking "Log Symptom" above
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
