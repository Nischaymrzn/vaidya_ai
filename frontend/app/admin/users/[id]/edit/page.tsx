import { notFound } from "next/navigation";
import { getUserById } from "@/lib/actions/admin-action";
import { EditUserForm } from "./_components/edit-user-form";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const response = await getUserById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  return <EditUserForm user={response.data} />;
}
