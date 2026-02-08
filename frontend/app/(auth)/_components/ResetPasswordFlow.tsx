"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "../_hooks/use-reset-password";

export function ResetPasswordFlow() {
  const {
    form: { register, handleSubmit, formState: { errors } },
    onSubmit,
    isSubmitting,
    token,
  } = useResetPassword();

  // Invalid token
  if (!token) {
    return (
      <div className="w-full max-w-[400px] mx-auto">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Invalid link
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This link is invalid or has expired. Request a new one.
          </p>
          <Button asChild className="mt-6 w-full h-11 bg-primary hover:bg-primary/90">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
          <p className="mt-4">
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 3: Create new password
  return (
    <div className="w-full max-w-[500px] mx-auto space-y-6">
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full ${i <= 3 ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="rounded-lg border bg-card p-8">
        <h2 className="text-lg font-semibold text-foreground text-center">
          Create new password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Step 3 of 3 · Choose a strong password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              New password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-11"
              {...register("newPassword")}
            />
            {errors.newPassword?.message && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              8+ chars, 1 lowercase, 1 number, 1 special
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-11"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword?.message && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full bg-primary hover:bg-primary/90"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
