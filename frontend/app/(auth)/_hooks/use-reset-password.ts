"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/actions/auth-action";
import { resetPasswordSchema, ResetPasswordFormData } from "../_schemas/schemas";

export const useResetPassword = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    if (!token) {
      toast.error("Invalid or missing reset link. Please request a new one.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await resetPassword(token, data.newPassword);

        if (!response?.success) {
          toast.error(response?.message || "Failed to reset password.");
          return;
        }

        toast.success("Password changed. Sign in to continue.");
        router.push("/login");
      } catch (error: Error | unknown) {
        const err = error as { message?: string };
        toast.error(err?.message || "An unexpected error occurred.");
      }
    });
  }

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting || isPending,
    token,
  };
};
