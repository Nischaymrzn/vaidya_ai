"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import { TUser } from "@/lib/definition";
import { cn } from "@/lib/utils";

interface ProtectedHeaderProps {
  user: TUser;
}

export function ProtectedHeader({ user }: ProtectedHeaderProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
      window.location.href = "/login";
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" prefetch={false} className="text-xl font-bold text-foreground">
              Vaidya
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden sm:inline mt-1">
              {user.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground mt-1"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
