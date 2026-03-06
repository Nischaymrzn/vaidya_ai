"use client";

import { useState, useEffect, useCallback } from "react";
import { TUser, Role } from "@/lib/definition";
import { UsersTable } from "./users-table";
import { UsersAnalytics } from "./users-analytics";
import { CreateUserModal } from "./create-user-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, ShieldCheck, Table2, BarChart3 } from "lucide-react";
import { getAllUsers, type PaginationInfo } from "@/lib/actions/admin-action";

export function UsersClient() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [users, setUsers] = useState<TUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const fetchUsers = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const res = await getAllUsers({ page: pageNum, limit });
        if (res.success && res.data) {
          setUsers(res.data);
          setPagination(res.pagination ?? null);
        }
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handleUserCreated = () => {
    fetchUsers(page);
  };

  const handleUserDeleted = () => {
    fetchUsers(page);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "—" : pagination?.total ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On This Page</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "—" : users.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? "—" : users.filter((u) => u.role === Role.ADMIN).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList className="grid w-full max-w-100 grid-cols-2">
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
          <UsersTable
            users={users}
            loading={loading}
            pagination={pagination}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onCreateUser={() => setCreateModalOpen(true)}
            onUserDeleted={handleUserDeleted}
          />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <UsersAnalytics users={users} />
        </TabsContent>
      </Tabs>

      <CreateUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleUserCreated}
      />
    </div>
  );
}
