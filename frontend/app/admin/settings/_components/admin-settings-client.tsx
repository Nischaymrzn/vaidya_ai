"use client";

import { useEffect, useState } from "react";
import { Bell, Save, ShieldCheck, SlidersHorizontal, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type SettingsState = {
  highRiskThreshold: string;
  moderateRiskThreshold: string;
  maxUploadSizeMb: string;
  enableImagePrediction: boolean;
  enableDoctorProfiles: boolean;
  notifyOnHighRisk: boolean;
  notifyOnModelFailures: boolean;
};

const SETTINGS_STORAGE_KEY = "admin-platform-settings";

const defaultSettings: SettingsState = {
  highRiskThreshold: "70",
  moderateRiskThreshold: "40",
  maxUploadSizeMb: "5",
  enableImagePrediction: true,
  enableDoctorProfiles: true,
  notifyOnHighRisk: true,
  notifyOnModelFailures: true,
};

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SettingsState;
      setSettings({ ...defaultSettings, ...parsed });
    } catch {
      toast.error("Failed to load saved settings.");
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const high = Number(settings.highRiskThreshold);
      const moderate = Number(settings.moderateRiskThreshold);
      const maxUpload = Number(settings.maxUploadSizeMb);

      if (
        !Number.isFinite(high) ||
        !Number.isFinite(moderate) ||
        !Number.isFinite(maxUpload)
      ) {
        toast.error("Thresholds and upload size must be numeric.");
        return;
      }

      if (moderate >= high) {
        toast.error("Moderate threshold must be lower than high threshold.");
        return;
      }

      if (maxUpload < 1 || maxUpload > 50) {
        toast.error("Upload size must be between 1 MB and 50 MB.");
        return;
      }

      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      toast.success("Admin settings saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    toast.success("Settings reset to defaults.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Admin Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure risk policy, platform behavior, and admin notifications.
          </p>
        </div>
        <Badge className="bg-slate-100 text-slate-700">Policy Controls</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Prediction safety thresholds
            </CardTitle>
            <CardDescription>
              Configure how risk levels are categorized across prediction modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>High risk threshold (%)</Label>
              <Input
                value={settings.highRiskThreshold}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, highRiskThreshold: event.target.value }))
                }
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label>Moderate risk threshold (%)</Label>
              <Input
                value={settings.moderateRiskThreshold}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, moderateRiskThreshold: event.target.value }))
                }
                inputMode="numeric"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Upload policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Max upload size (MB)</Label>
              <Input
                value={settings.maxUploadSizeMb}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, maxUploadSizeMb: event.target.value }))
                }
                inputMode="numeric"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable image prediction</p>
                <p className="text-xs text-muted-foreground">Allow upload-based model endpoints</p>
              </div>
              <Switch
                checked={settings.enableImagePrediction}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, enableImagePrediction: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable AI doctors</p>
                <p className="text-xs text-muted-foreground">Show AI doctors in user interface</p>
              </div>
              <Switch
                checked={settings.enableDoctorProfiles}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, enableDoctorProfiles: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Admin notifications
          </CardTitle>
          <CardDescription>Control which operational alerts are delivered to admins.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium">High risk case alerts</p>
              <p className="text-xs text-muted-foreground">Notify when high-risk predictions are generated</p>
            </div>
            <Switch
              checked={settings.notifyOnHighRisk}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notifyOnHighRisk: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Model failure alerts</p>
              <p className="text-xs text-muted-foreground">Notify when inference requests fail</p>
            </div>
            <Switch
              checked={settings.notifyOnModelFailures}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notifyOnModelFailures: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Apply changes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving} className="rounded-full">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save settings"}
          </Button>
          <Button variant="outline" onClick={handleReset} className="rounded-full">
            Reset defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
