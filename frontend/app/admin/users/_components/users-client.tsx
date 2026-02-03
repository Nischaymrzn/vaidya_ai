"use client";

import { useState } from "react";
import { TUser, Role } from "@/lib/definition";
import { UsersTable } from "./users-table";
import { UsersAnalytics } from "./users-analytics";
import { CreateUserModal } from "./create-user-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, ShieldCheck, Table2, BarChart3 } from "lucide-react";

interface UsersClientProps {
  users: TUser[];
}

export function UsersClient({ users }: UsersClientProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const adminUsers = users.filter((u) => u.role === Role.ADMIN).length;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users },
    { label: "Active", value: activeUsers, icon: UserCheck },
    { label: "Admins", value: adminUsers, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="space-y-4">
          <UsersTable users={users} onCreateUser={() => setCreateModalOpen(true)} />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <UsersAnalytics users={users} />
        </TabsContent>
      </Tabs>

      <CreateUserModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
