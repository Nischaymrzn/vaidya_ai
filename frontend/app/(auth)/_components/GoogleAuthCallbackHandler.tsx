"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSession } from "@/lib/session";
import { getMe } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GoogleAuthCallbackHandlerProps {
  children: React.ReactNode;
}

export function GoogleAuthCallbackHandler({ children }: GoogleAuthCallbackHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [handled, setHandled] = useState(false);
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      toast.error(decodeURIComponent(error));
      router.replace("/login");
      setHandled(true);
      return;
    }
    if (!token || handled) return;

    let cancelled = false;

    async function handleToken() {
      try {
        await createSession(token!);
        const response = await getMe();
        const user = response?.data;
        const role = user?.role;

        if (!cancelled) {
          toast.success("Signed in successfully.");
          if (role === "admin") {
            router.replace("/admin/users");
          } else {
            router.replace("/dashboard");
          }
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to complete sign in.");
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setHandled(true);
      }
    }

    handleToken();
    return () => {
      cancelled = true;
    };
  }, [token, error, router, handled]);

  if (token && !handled) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4 w-full max-w-xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F7AE0]" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    );
  }

  return <>{children}</>;
}
