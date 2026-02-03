import { getCurrentUser } from "@/lib/dal";
import { ProtectedHeader } from "../_components/protected-header";
import { redirect } from "next/dist/client/components/navigation";
import { Role } from "@/lib/definition";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === Role.ADMIN) redirect("/admin/users");

  return <>
    <ProtectedHeader user={user} />
    <main className="container mx-auto px-4 py-8 max-w-4xl">{children}</main></>;
}
