import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordFlow } from "../_components/ResetPasswordFlow";

export const metadata: Metadata = {
  title: "Reset Password - Vaidya.ai",
  description: "Set a new password for your Vaidya.ai account",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-1.5 w-full rounded-full bg-muted" />
      <div className="h-11 rounded-lg bg-muted" />
      <div className="h-11 rounded-lg bg-muted" />
      <div className="h-11 rounded-lg bg-muted" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-lg mx-auto mt-16">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Follow the steps to regain access
        </p>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <ResetPasswordFlow />
      </Suspense>
    </div>
  );
}
