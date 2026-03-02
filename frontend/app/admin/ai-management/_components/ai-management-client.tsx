"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Plus, RefreshCcw, Search, Stethoscope, Trash2 } from "lucide-react";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_DOCTOR_CATALOG, AI_MODULE_CATALOG, type AiModuleCategory } from "@/lib/ai-catalog";
import { toast } from "sonner";

type ModelItem = {
  id: string;
  name: string;
  category: AiModuleCategory;
  version: string;
  scope: string;
  clientPath: string;
  apiPath: string;
  description: string;
  active: boolean;
  updatedAt: string;
};

type DoctorItem = {
  id: string;
  name: string;
  specialty: string;
  title: string;
  tags: string[];
  image: string;
  active: boolean;
  updatedAt: string;
};

const MODEL_STORAGE_KEY = "admin-ai-models";
const DOCTOR_STORAGE_KEY = "admin-ai-doctors";
const PRIMARY = "#1F7AE0";
const CATALOG_UPDATED_AT = "";

const catalogModels: ModelItem[] = AI_MODULE_CATALOG.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  version: item.defaultVersion,
  scope: item.scope,
  clientPath: item.clientPath,
  apiPath: item.apiPath,
  description: item.description,
  active: item.defaultActive,
  updatedAt: CATALOG_UPDATED_AT,
}));

const catalogDoctors: DoctorItem[] = AI_DOCTOR_CATALOG.map((item) => ({
  id: item.id,
  name: item.name,
  specialty: item.specialty,
  title: item.title,
  tags: item.tags,
  image: item.image,
  active: item.defaultActive,
  updatedAt: CATALOG_UPDATED_AT,
}));

const parseStorage = <T,>(value: string | null): T[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const normalizeDoctorEntries = (items: unknown[]): DoctorItem[] => {
  return items.map((item, index) => {
    const source =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : {};

    return {
      id: normalizeString(source.id, `doctor-${index + 1}`),
      name: normalizeString(source.name, "Unknown Doctor"),
      specialty: normalizeString(source.specialty, "General"),
      title: normalizeString(source.title, "AI Doctor"),
      tags: normalizeTags(source.tags),
      image: normalizeString(source.image, "/doctor.png"),
      active: typeof source.active === "boolean" ? source.active : true,
      updatedAt: normalizeString(source.updatedAt, new Date().toISOString()),
    };
  });
};

const mergeWithCatalog = <T extends { id: string }>(stored: T[], defaults: T[]) => {
  const byId = new Map<string, T>();
  defaults.forEach((item) => byId.set(item.id, item));
  stored.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values());
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const generateId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;

export function AiManagementClient() {
  const [models, setModels] = useState<ModelItem[]>(catalogModels);
  const [doctors, setDoctors] = useState<DoctorItem[]>(catalogDoctors);

  const [modelQuery, setModelQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");

  const [modelName, setModelName] = useState("");
  const [modelVersion, setModelVersion] = useState("");
  const [modelScope, setModelScope] = useState("General");
  const [modelCategory, setModelCategory] = useState<AiModuleCategory>("Prediction");
  const [modelClientPath, setModelClientPath] = useState("");
  const [modelApiPath, setModelApiPath] = useState("");

  const [doctorName, setDoctorName] = useState("");
  const [doctorTitle, setDoctorTitle] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState("General");
  const [doctorTags, setDoctorTags] = useState("");

  useEffect(() => {
    const storedModels = parseStorage<ModelItem>(window.localStorage.getItem(MODEL_STORAGE_KEY));
    const storedDoctorsRaw = parseStorage<unknown>(
      window.localStorage.getItem(DOCTOR_STORAGE_KEY),
    );
    const storedDoctors = normalizeDoctorEntries(storedDoctorsRaw);

    const mergedModels = mergeWithCatalog(storedModels, catalogModels);
    const mergedDoctors = mergeWithCatalog(storedDoctors, catalogDoctors);

    const frame = window.requestAnimationFrame(() => {
      setModels(mergedModels);
      setDoctors(mergedDoctors);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(models));
  }, [models]);

  useEffect(() => {
    window.localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(doctors));
  }, [doctors]);

  const activeModels = useMemo(
    () => models.filter((item) => item.active).length,
    [models],
  );
  const activeDoctors = useMemo(
    () => doctors.filter((item) => item.active).length,
    [doctors],
  );

  const filteredModels = useMemo(() => {
    const query = modelQuery.trim().toLowerCase();
    if (!query) return models;
    return models.filter((model) =>
      [model.name, model.scope, model.category, model.apiPath, model.clientPath]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [modelQuery, models]);

  const filteredDoctors = useMemo(() => {
    const query = doctorQuery.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialty, doctor.title, ...doctor.tags]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [doctorQuery, doctors]);

  const modelCategoryChart = useMemo(() => {
    const summary = models.reduce<Record<string, number>>((acc, model) => {
      acc[model.category] = (acc[model.category] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(summary).map(([category, count]) => ({
      category,
      count,
    }));
  }, [models]);

  const doctorSpecialtyChart = useMemo(() => {
    const summary = doctors.reduce<Record<string, number>>((acc, doctor) => {
      acc[doctor.specialty] = (acc[doctor.specialty] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(summary).map(([specialty, count]) => ({
      specialty,
      count,
      fill: "#1F7AE0",
    }));
  }, [doctors]);

  const handleSyncCatalog = () => {
    setModels((prev) => mergeWithCatalog(prev, catalogModels));
    setDoctors((prev) => mergeWithCatalog(prev, catalogDoctors));
    toast.success("Synced with client-side AI modules and doctors.");
  };

  const handleAddModel = () => {
    if (!modelName.trim() || !modelVersion.trim() || !modelApiPath.trim()) {
      toast.error("Model name, version, and API path are required.");
      return;
    }

    const newModel: ModelItem = {
      id: generateId("model"),
      name: modelName.trim(),
      version: modelVersion.trim(),
      scope: modelScope,
      category: modelCategory,
      clientPath: modelClientPath.trim() || "/",
      apiPath: modelApiPath.trim(),
      description: "Custom admin model entry",
      active: true,
      updatedAt: new Date().toISOString(),
    };

    setModels((prev) => [newModel, ...prev]);
    setModelName("");
    setModelVersion("");
    setModelScope("General");
    setModelCategory("Prediction");
    setModelClientPath("");
    setModelApiPath("");
    toast.success("AI module added.");
  };

  const handleDeleteModel = (id: string) => {
    setModels((prev) => prev.filter((item) => item.id !== id));
    toast.success("AI module removed.");
  };

  const handleToggleModel = (id: string, active: boolean) => {
    setModels((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active, updatedAt: new Date().toISOString() } : item,
      ),
    );
  };

  const handleAddDoctor = () => {
    if (!doctorName.trim() || !doctorTitle.trim()) {
      toast.error("Doctor name and title are required.");
      return;
    }

    const parsedTags = doctorTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const newDoctor: DoctorItem = {
      id: generateId("doctor"),
      name: doctorName.trim(),
      title: doctorTitle.trim(),
      specialty: doctorSpecialty,
      tags: parsedTags,
      image: "/doctor.png",
      active: true,
      updatedAt: new Date().toISOString(),
    };

    setDoctors((prev) => [newDoctor, ...prev]);
    setDoctorName("");
    setDoctorTitle("");
    setDoctorSpecialty("General");
    setDoctorTags("");
    toast.success("AI doctor added.");
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors((prev) => prev.filter((item) => item.id !== id));
    toast.success("AI doctor removed.");
  };

  const handleToggleDoctor = (id: string, active: boolean) => {
    setDoctors((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active, updatedAt: new Date().toISOString() } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            AI Models & Doctors
          </h1>
          <p className="text-sm text-muted-foreground">
            Central management for every AI module and AI doctor shown on the client side.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {activeModels}/{models.length} modules active
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {activeDoctors}/{doctors.length} doctors active
          </Badge>
          <Button variant="outline" className="rounded-full" onClick={handleSyncCatalog}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Sync catalog
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle>Module category split</CardTitle>
            <CardDescription>Distribution of AI modules by function</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-52 w-full" config={{ count: { label: "Count", color: PRIMARY } }}>
              <BarChart data={modelCategoryChart} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill={PRIMARY} radius={[8, 8, 8, 8]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle>Doctor specialty split</CardTitle>
            <CardDescription>Distribution of AI doctors by specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-52 w-full"
              config={{ count: { label: "Count", color: PRIMARY } }}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={doctorSpecialtyChart}
                  dataKey="count"
                  nameKey="specialty"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  label={({ specialty, count }) => `${specialty}: ${count}`}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="models">AI Modules</TabsTrigger>
          <TabsTrigger value="doctors">AI Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Add AI module
              </CardTitle>
              <CardDescription>Register new module entries used by frontend and APIs.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-6">
              <div className="space-y-2 sm:col-span-2">
                <Label>Module name</Label>
                <Input value={modelName} onChange={(event) => setModelName(event.target.value)} placeholder="TB Predictor" />
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input value={modelVersion} onChange={(event) => setModelVersion(event.target.value)} placeholder="1.0.0" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={modelCategory} onValueChange={(value) => setModelCategory(value as AiModuleCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prediction">Prediction</SelectItem>
                    <SelectItem value="Assistant">Assistant</SelectItem>
                    <SelectItem value="Analysis">Analysis</SelectItem>
                    <SelectItem value="Scan">Scan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Input value={modelScope} onChange={(event) => setModelScope(event.target.value)} placeholder="Cardiology" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Client path</Label>
                <Input value={modelClientPath} onChange={(event) => setModelClientPath(event.target.value)} placeholder="/health-intelligence/predictions/..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>API path</Label>
                <Input value={modelApiPath} onChange={(event) => setModelApiPath(event.target.value)} placeholder="/predict/..." />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <Button onClick={handleAddModel} className="w-full rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add module
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Module catalog</CardTitle>
                  <CardDescription>All client-visible AI modules</CardDescription>
                </div>
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={modelQuery}
                    onChange={(event) => setModelQuery(event.target.value)}
                    placeholder="Search modules..."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Client path</TableHead>
                      <TableHead>API path</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.length ? (
                      filteredModels.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>{model.category}</TableCell>
                          <TableCell>{model.version}</TableCell>
                          <TableCell className="max-w-52 truncate">{model.clientPath}</TableCell>
                          <TableCell className="max-w-52 truncate">{model.apiPath}</TableCell>
                          <TableCell>
                            <Badge
                              variant={model.active ? "outline" : "secondary"}
                              className={model.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
                            >
                              {model.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(model.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Switch
                                checked={model.active}
                                onCheckedChange={(checked) => handleToggleModel(model.id, checked)}
                                aria-label={`Toggle module ${model.name}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteModel(model.id)}
                                aria-label={`Delete module ${model.name}`}
                              >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-20 text-center text-sm text-muted-foreground">
                          No modules found for this search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Add AI doctor
              </CardTitle>
              <CardDescription>Add specialist entries used in AI doctors module.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-6">
              <div className="space-y-2 sm:col-span-2">
                <Label>Doctor name</Label>
                <Input value={doctorName} onChange={(event) => setDoctorName(event.target.value)} placeholder="Dr. Jane Doe" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Title</Label>
                <Input value={doctorTitle} onChange={(event) => setDoctorTitle(event.target.value)} placeholder="Respiratory AI Specialist" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Specialty</Label>
                <Input value={doctorSpecialty} onChange={(event) => setDoctorSpecialty(event.target.value)} placeholder="Respiratory" />
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label>Tags (comma separated)</Label>
                <Input value={doctorTags} onChange={(event) => setDoctorTags(event.target.value)} placeholder="Lung Function, Infection Screening, Oxygen Monitoring" />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <Button onClick={handleAddDoctor} className="w-full rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add doctor
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Doctor catalog</CardTitle>
                  <CardDescription>All AI doctors shown in client experience</CardDescription>
                </div>
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={doctorQuery}
                    onChange={(event) => setDoctorQuery(event.target.value)}
                    placeholder="Search doctors..."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.length ? (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">{doctor.name}</TableCell>
                          <TableCell>{doctor.title}</TableCell>
                          <TableCell>{doctor.specialty}</TableCell>
                          <TableCell>
                            <div className="flex max-w-72 flex-wrap gap-1">
                              {(doctor.tags ?? []).length ? (
                                doctor.tags.slice(0, 3).map((tag) => (
                                  <Badge key={`${doctor.id}-${tag}`} variant="secondary" className="text-[10px]">
                                    {tag}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No tags</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={doctor.active ? "outline" : "secondary"}
                              className={doctor.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
                            >
                              {doctor.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(doctor.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Switch
                                checked={doctor.active}
                                onCheckedChange={(checked) => handleToggleDoctor(doctor.id, checked)}
                                aria-label={`Toggle doctor ${doctor.name}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                aria-label={`Delete doctor ${doctor.name}`}
                              >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-20 text-center text-sm text-muted-foreground">
                          No doctors found for this search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
