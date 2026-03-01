"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Bot, Settings2, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AI_DOCTOR_CATALOG, AI_MODULE_CATALOG } from "@/lib/ai-catalog";
import type { TUser } from "@/lib/definition";

const PRIMARY = "#1F7AE0";

type AdminDashboardClientProps = {
  users: TUser[];
  totalUsers: number;
};

const buildLastSixMonthsLabels = () => {
  const labels: string[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(
      date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
    );
  }
  return labels;
};

export function AdminDashboardClient({ users, totalUsers }: AdminDashboardClientProps) {
  const activeUsers = useMemo(
    () => users.filter((item) => item.isActive !== false).length,
    [users],
  );
  const adminUsers = useMemo(
    () => users.filter((item) => item.role === "admin").length,
    [users],
  );

  const registrationTrend = useMemo(() => {
    const labels = buildLastSixMonthsLabels();
    const counts = new Map<string, number>(labels.map((label) => [label, 0]));

    users.forEach((user) => {
      if (!user.createdAt) return;
      const createdAt = new Date(user.createdAt);
      if (Number.isNaN(createdAt.getTime())) return;
      const label = createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (!counts.has(label)) return;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });

    return labels.map((month) => ({
      month,
      users: counts.get(month) ?? 0,
    }));
  }, [users]);

  const roleDistribution = useMemo(() => {
    const admins = users.filter((item) => item.role === "admin").length;
    const standardUsers = Math.max(0, users.length - admins);
    return [
      { role: "Admins", count: admins, fill: "#1F7AE0" },
      { role: "Users", count: standardUsers, fill: "#6AA6EA" },
    ];
  }, [users]);

  const moduleDistribution = useMemo(() => {
    const categoryCount = AI_MODULE_CATALOG.reduce<Record<string, number>>((acc, module) => {
      acc[module.category] = (acc[module.category] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));
  }, []);

  const latestMonth = registrationTrend[registrationTrend.length - 1]?.users ?? 0;
  const previousMonth = registrationTrend[registrationTrend.length - 2]?.users ?? 0;
  const growthDelta = latestMonth - previousMonth;
  const growthLabel =
    growthDelta > 0 ? `+${growthDelta} vs last month` : growthDelta < 0 ? `${growthDelta} vs last month` : "No monthly change";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Operations center</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of users, AI modules, doctors, and platform readiness.
          </p>
        </div>
        <Badge className="bg-slate-100 text-slate-700">Admin Only</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total users</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>All accounts</span>
            <Users className="h-4 w-4" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Active users</CardDescription>
            <CardTitle className="text-3xl">{activeUsers}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{growthLabel}</span>
            <ShieldCheck className="h-4 w-4" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Admin users</CardDescription>
            <CardTitle className="text-3xl">{adminUsers}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Privileged operators</span>
            <Settings2 className="h-4 w-4" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>AI modules</CardDescription>
            <CardTitle className="text-3xl">{AI_MODULE_CATALOG.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Client-integrated modules</span>
            <Bot className="h-4 w-4" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>AI doctors</CardDescription>
            <CardTitle className="text-3xl">{AI_DOCTOR_CATALOG.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Specialized assistants</span>
            <Stethoscope className="h-4 w-4" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle>User registration trend</CardTitle>
            <CardDescription>Recent six-month onboarding pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-64 w-full"
              config={{ users: { label: "Users", color: PRIMARY } }}
            >
              <AreaChart data={registrationTrend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminUsersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickMargin={8}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={PRIMARY}
                  fill="url(#adminUsersFill)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle>Role distribution</CardTitle>
              <CardDescription>User vs admin split in sampled records</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                className="h-56 w-full"
                config={{
                  Admins: { label: "Admins", color: "#1F7AE0" },
                  Users: { label: "Users", color: "#6AA6EA" },
                }}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={roleDistribution}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={90}
                    paddingAngle={4}
                    label={({ role, count }) => `${role}: ${count}`}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle>AI module distribution</CardTitle>
              <CardDescription>How modules are split by function</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                className="h-48 w-full"
                config={{ count: { label: "Count", color: PRIMARY } }}
              >
                <BarChart data={moduleDistribution} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[8, 8, 8, 8]} fill={PRIMARY} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Create, update, and manage user accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full rounded-full">
              <Link href="/admin/users">Open users module</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>AI Models & Doctors</CardTitle>
            <CardDescription>Manage every client-side AI module and doctor catalog.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Keep modules and doctors aligned with production experience.
            </p>
            <Button asChild className="w-full rounded-full">
              <Link href="/admin/ai-management">Open AI management</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Adjust safety thresholds and admin controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/admin/settings">Open settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
