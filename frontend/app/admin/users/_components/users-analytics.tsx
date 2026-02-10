"use client";

import { TUser, Role } from "@/lib/definition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, LineChart, CartesianGrid, Line } from "recharts";

interface UsersAnalyticsProps {
  users: TUser[];
}

const CHART_COLORS = {
  admin: "var(--chart-1)",
  user: "var(--chart-2)",
  active: "var(--chart-3)",
  inactive: "var(--chart-4)",
};

export function UsersAnalytics({ users }: UsersAnalyticsProps) {
  const roleData = [
    {
      name: "Admin",
      value: users.filter((u) => u.role === Role.ADMIN).length,
      fill: CHART_COLORS.admin,
    },
    {
      name: "User",
      value: users.filter((u) => u.role === Role.USER).length,
      fill: CHART_COLORS.user,
    },
  ];

  const statusData = [
    {
      name: "Active",
      value: users.filter((u) => u.isActive !== false).length,
      fill: CHART_COLORS.active,
    },
    {
      name: "Inactive",
      value: users.filter((u) => u.isActive === false).length,
      fill: CHART_COLORS.inactive,
    },
  ];

  const usersOnly = users.filter((u) => u.role === Role.USER);

  const registrationsByDate = usersOnly.reduce<Record<string, number>>(
    (acc, user) => {
      // @ts-ignore
      const date = new Date(user.createdAt).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {}
  );
  const registrationChartData = Object.entries(registrationsByDate)
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );



  const chartConfig = {
    value: { label: "Count", color: CHART_COLORS.admin },
    admin: { label: "Admin", color: CHART_COLORS.admin },
    user: { label: "User", color: CHART_COLORS.user },
    active: { label: "Active", color: CHART_COLORS.active },
    inactive: { label: "Inactive", color: CHART_COLORS.inactive },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of admin vs user accounts
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart data={roleData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={60}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users by Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Active vs inactive accounts
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Registrations Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">
            Shows when most users registered
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-75 w-full">
            <LineChart data={registrationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>


    </div>
  );
}
