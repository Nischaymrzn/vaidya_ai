"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSession } from "@/lib/session";
import { signin } from "@/lib/actions/auth-action";
import { loginSchema, LoginFormData } from "../_schemas/schemas";

export const useSignIn = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    startTransition(async () => {
      try {
        const response = await signin(data);
        console.log(response);
        const accessToken = response?.data?.accessToken;

        if (!accessToken) {
          const errorMessage =
            response?.message ||
            "Invalid credentials. Please check your email and password.";
          toast.error(errorMessage);
          return;
        }

        await createSession(accessToken);
        router.refresh();

        toast.success(response?.message || "Signed in successfully.");
      } catch (error: Error | any) {
        const errorMessage =
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred while signing in. Please try again.";
        toast.error(errorMessage);
      }
    });
  }

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting || isPending,
  };
};
