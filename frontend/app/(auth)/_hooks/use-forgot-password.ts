"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/actions/auth-action";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "../_schemas/schemas";

export const useForgotPassword = () => {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    startTransition(async () => {
      try {
        const response = await requestPasswordReset(data.email);

        if (!response?.success) {
          toast.error(response?.message || "Failed to send reset email.");
          return;
        }

        setSubmittedEmail(data.email);
        setStep(2);
        toast.success("Check your inbox for the reset link.");
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
    step,
    submittedEmail,
  };
};
