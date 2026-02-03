import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { Role } from "@/lib/definition";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role === Role.ADMIN) redirect("/admin/users");

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
