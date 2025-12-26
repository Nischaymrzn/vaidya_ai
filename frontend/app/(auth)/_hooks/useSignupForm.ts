"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { signupSchema, SignupFormData } from "../_schemas/schemas";
import { signupAction } from "../_actions/signup.actions";

export function useSignupForm() {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const onSubmit = (values: SignupFormData) => {
    startTransition(async () => {
      await signupAction(values);
      toast.success("Account created successfully");
    });
  };

  return {
    form,
    onSubmit,
    isLoading: form.formState.isSubmitting || pending,
  };
}
