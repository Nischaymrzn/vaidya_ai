"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile-action";
import { TUser } from "@/lib/definition";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface PasswordFormProps {
  user: TUser;
}

export function PasswordForm({ user }: PasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("password", data.newPassword);

      const result = await updateProfile(user._id || user.id, formData);
      if (result.success) {
        toast.success("Password updated");
        reset();
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" placeholder="Enter new password" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Confirm new password</Label>
            <Input type="password" placeholder="Confirm new password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="bg-[#1F7AE0] hover:bg-[#1B6BB8]">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
