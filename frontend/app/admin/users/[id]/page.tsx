import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserById } from "@/lib/actions/admin-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import { Role } from "@/lib/definition";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const response = await getUserById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const user = response.data;

  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.number || "Not provided" },
    { label: "Role", value: user.role === Role.ADMIN ? "Admin" : "User" },
    { label: "Status", value: user.isActive !== false ? "Active" : "Inactive" },
    { label: "Email Verified", value: user.isEmailVerified ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">User Details</h1>
        </div>
        <Button asChild className="bg-[#1F7AE0] hover:bg-[#1B6BB8]">
          <Link href={`/admin/users/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {details.map((item) => (
              <div key={item.label} className="py-3 flex justify-between">
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="font-medium">
                  {item.label === "Role" ? (
                    <Badge variant={user.role === Role.ADMIN ? "default" : "secondary"}>
                      {item.value}
                    </Badge>
                  ) : item.label === "Status" ? (
                    <Badge variant={user.isActive !== false ? "outline" : "destructive"}>
                      {item.value}
                    </Badge>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
