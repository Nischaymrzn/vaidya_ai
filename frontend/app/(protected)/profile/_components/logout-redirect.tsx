"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth-action";
import { toast } from "sonner";

export function LogoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      toast.success("Logged out");
      router.push("/login");
    };
    doLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Logging out...</p>
    </div>
  );
}
