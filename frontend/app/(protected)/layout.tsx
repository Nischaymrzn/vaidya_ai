import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { Role } from "@/lib/definition";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { AppNavbar } from "./_components/app-navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role === Role.ADMIN) redirect("/admin/users");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppNavbar user={user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
