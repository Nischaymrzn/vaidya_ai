"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import { TUser } from "@/lib/definition";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  user: TUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/users" className="text-xl font-bold text-foreground">
              Admin Panel
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
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
