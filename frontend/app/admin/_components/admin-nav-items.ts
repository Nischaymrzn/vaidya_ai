import {
  Bot,
  LayoutDashboard,
  Settings2,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/ai-management",
    label: "AI Management",
    icon: Bot,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings2,
  },
];

export const adminPageTitleMap = new Map<string, string>([
  ["/admin", "Admin Dashboard"],
  ["/admin/users", "Users"],
  ["/admin/ai-management", "AI Models & Doctors"],
  ["/admin/settings", "Admin Settings"],
]);
