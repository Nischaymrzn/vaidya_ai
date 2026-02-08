"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { TUser } from "@/lib/definition"

import { pageTitleMap, profileNavItems } from "./nav-items"

const titleFromPathname = (pathname: string) => {
  const mapped = pageTitleMap.get(pathname)
  if (mapped) {
    return mapped
  }

  if (pathname.startsWith("/profile")) {
    return "Profile"
  }

  const segments = pathname.split("/").filter(Boolean)
  const last = segments[segments.length - 1] ?? "Dashboard"
  return last
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

interface AppNavbarProps {
  user: TUser
}

export function AppNavbar({ user }: AppNavbarProps) {
  const pathname = usePathname()
  const pageTitle = titleFromPathname(pathname)
  const initials =
    user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() ||
    "VA"

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:gap-6 md:px-6">
        <div className="flex w-full items-center gap-3 md:w-auto">
          <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground md:hidden" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-1 items-center gap-3 md:w-auto">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search health records..."
              className="h-9 rounded-lg border-border/70 bg-muted/40 pl-9 text-sm shadow-none focus-visible:ring-2"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group flex items-center gap-3 rounded-full bg-transparent px-3 py-1.5 transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user.name ?? "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 flex-col text-left sm:flex">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {user.name ?? "Vaidya User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email ?? "user@vaidya.health"}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.profilePicture}
                      alt={user.name ?? "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name ?? "Vaidya User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email ?? "user@vaidya.health"}
                    </p>
                    {user.number ? (
                      <p className="truncate text-xs text-muted-foreground">{user.number}</p>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profileNavItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
