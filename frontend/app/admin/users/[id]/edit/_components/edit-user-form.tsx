"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { updateUser } from "@/lib/actions/admin-action";
import { toast } from "sonner";
import { TUser, Role } from "@/lib/definition";

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  number: z.string().optional(),
  role: z.enum(["user", "admin"]),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  password: z.string().optional(),
});

type FormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  user: TUser;
}

export function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      number: user.number || "",
      role: user.role === Role.ADMIN ? "admin" : "user",
      isActive: user.isActive !== false,
      isEmailVerified: user.isEmailVerified || false,
      password: "",
    },
  });

  const isActive = watch("isActive");
  const isEmailVerified = watch("isEmailVerified");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("role", data.role);
      formData.append("isActive", String(data.isActive));
      formData.append("isEmailVerified", String(data.isEmailVerified));
      if (data.number) formData.append("number", data.number);
      if (data.password) formData.append("password", data.password);

      const result = await updateUser(user._id || user.id, formData);

      if (result.success) {
        toast.success("User updated");
        router.push(`/admin/users/${user._id || user.id}`);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/users/${user._id || user.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...register("number")} />
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  defaultValue={user.role === Role.ADMIN ? "admin" : "user"}
                  onValueChange={(v) => setValue("role", v as "user" | "admin")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Leave blank to keep current" {...register("password")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Active Account</p>
                <p className="text-sm text-muted-foreground">User can log in to the system</p>
              </div>
              <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Verified</p>
                <p className="text-sm text-muted-foreground">Mark email as verified</p>
              </div>
              <Switch checked={isEmailVerified} onCheckedChange={(v) => setValue("isEmailVerified", v)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild disabled={isSubmitting}>
            <Link href={`/admin/users/${user._id || user.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#1F7AE0] hover:bg-[#1B6BB8]">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
