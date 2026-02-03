import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { Role } from "@/lib/definition";
import { AdminHeader } from "./_components/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">{children}</main>
    </div>
  );
}
