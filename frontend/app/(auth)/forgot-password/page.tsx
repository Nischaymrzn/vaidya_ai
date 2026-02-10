import type { Metadata } from "next";
import { ForgotPasswordFlow } from "../_components/ForgotPasswordFlow";

export const metadata: Metadata = {
  title: "Forgot Password - Vaidya.ai",
  description: "Reset your Vaidya.ai account password",
};

export default function ForgotPasswordPage() {
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

      <ForgotPasswordFlow />
    </div>
  );
}
