"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, PanelLeftOpen, Search, Settings2, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { logout } from "@/lib/actions/auth-action";
import type { TUser } from "@/lib/definition";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { adminPageTitleMap } from "./admin-nav-items";

const titleFromPathname = (pathname: string) => {
  const mapped = adminPageTitleMap.get(pathname);
  if (mapped) return mapped;

  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/ai-management")) return "AI Models & Doctors";
  if (pathname.startsWith("/admin/settings")) return "Admin Settings";
  return "Admin Panel";
};

interface AdminNavbarProps {
  user: TUser;
}

export function AdminNavbar({ user }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = titleFromPathname(pathname);
  const { state, toggleSidebar } = useSidebar();

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex min-h-[72px] flex-wrap items-center gap-3 px-4 md:min-h-[70px] md:flex-nowrap md:gap-6 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted/60 hover:text-foreground md:hidden"
            aria-label="Toggle sidebar"
          >
            <PanelLeftOpen
              className={cn(
                "h-5 w-5 transition-transform duration-300 ease-out",
                state === "collapsed" ? "rotate-0" : "rotate-180",
              )}
            />
          </button>
          <h1 className="truncate text-[20px] font-medium tracking-tight text-foreground md:text-[27px]">
            {pageTitle}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden w-full max-w-md xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users, models, doctors..."
              className="h-10 w-80 rounded-lg border-border/70 bg-muted/40 pl-10 text-[15px] shadow-none focus-visible:ring-2"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group flex items-center gap-3 rounded-full bg-transparent px-3 py-1.5 transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]",
                )}
              >
                <Avatar className="h-9 w-9 md:h-10 md:w-10">
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user.name ?? "Admin"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 flex-col text-left sm:flex">
                  <span className="truncate text-[14px] font-semibold text-foreground md:text-[15px]">
                    {user.name ?? "Admin"}
                  </span>
                  <span className="truncate text-[12px] text-muted-foreground md:text-[13px]">
                    {user.email ?? "admin@vaidya.health"}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 md:h-5 md:w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.name ?? "Admin"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name ?? "Admin"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email ?? "admin@vaidya.health"}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/users" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span>Admin Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-rose-600 focus:text-rose-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
