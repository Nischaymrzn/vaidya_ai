"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { loginSchema, LoginFormData } from "../_schemas/schemas";
import { loginAction } from "../_actions/login.actions";
import { toast } from "sonner";

export function useLoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const onSubmit = (values: LoginFormData) => {
    startTransition(async () => {
      await loginAction(values);
      toast.success("Login successfully");
    });
  };

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting || pending,
  };
}
