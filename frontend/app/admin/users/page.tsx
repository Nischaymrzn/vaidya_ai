import { getAllUsers } from "@/lib/actions/admin-action";
import { UsersClient } from "./_components/users-client";

export default async function UsersPage() {
  const response = await getAllUsers();
  const users = response.data || [];

  return <UsersClient users={users} />;
}
