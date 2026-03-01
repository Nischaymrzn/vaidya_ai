import { getAllUsers } from "@/lib/actions/admin-action";
import { AdminDashboardClient } from "./_components/admin-dashboard-client";

export default async function AdminPage() {
  const userResponse = await getAllUsers({ page: 1, limit: 200 });
  const totalUsers = userResponse.pagination?.total ?? userResponse.data?.length ?? 0;
  const users = userResponse.data ?? [];

  return <AdminDashboardClient users={users} totalUsers={totalUsers} />;
}
