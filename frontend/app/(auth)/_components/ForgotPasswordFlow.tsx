"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "../_hooks/use-forgot-password";

export function ForgotPasswordFlow() {
  const {
    form: { register, handleSubmit, formState: { errors } },
    onSubmit,
    isSubmitting,
    step,
    submittedEmail,
  } = useForgotPassword();

  // Step 2: Check email
  if (step === 2) {
    return (
      <div className="w-full max-w-[500px] mx-auto space-y-6">
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full ${i <= 2 ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a reset link to{" "}
            <span className="font-medium text-foreground">{submittedEmail || "your email"}</span>.
            Click the link to set a new password.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Didn&apos;t see it? Check spam or{" "}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-medium text-primary hover:underline"
            >
              try again
            </button>
          </p>
          <Button asChild className="mt-6 w-full h-11 bg-primary hover:bg-primary/90">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Enter email
  return (
    <div className="w-full max-w-[500px] mx-auto space-y-6">
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full ${i === 1 ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="rounded-lg border bg-card p-8">
        <h2 className="text-lg font-semibold text-foreground text-center">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              className="h-11"
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-primary hover:bg-primary/90"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
