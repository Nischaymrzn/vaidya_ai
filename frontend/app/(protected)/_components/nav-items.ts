import type { LucideIcon } from "lucide-react";
import {
  BadgeQuestionMark,
  Brain,
  ChartColumnBig,
  FolderHeart,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  SquareActivity,
  Stethoscope,
  User,
  Users,
} from "lucide-react";

type NavLeafItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  items?: NavLeafItem[];
};

export const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/family-health", label: "Family Health", icon: Users },
  { href: "/health-records", label: "Health Records", icon: FolderHeart },
  {
    label: "Health Overview",
    icon: SquareActivity,
    items: [
      { href: "/vitals", label: "Vitals", icon: SquareActivity },
      { href: "/symptoms", label: "Symptoms", icon: HeartHandshake },
    ],
  },
  { href: "/analytics", label: "Analytics", icon: ChartColumnBig },
  {
    label: "Health Intelligence",
    icon: Brain,
    items: [
      {
        href: "/health-intelligence/risk-analysis",
        label: "Risk Analysis",
        icon: Brain,
      },
      {
        href: "/health-intelligence/ai-doctors",
        label: "Vaidya Care",
        icon: Stethoscope,
      },
      { href: "/ai-assistant", label: "Vaidya.ai", icon: Sparkles },
    ],
  },
];

export const profileNavItems: NavLeafItem[] = [
  { href: "/profile", label: "Profile", icon: User },
  {
    href: "/profile/account/personal",
    label: "Account settings",
    icon: Settings,
  },
  { href: "/profile/support/logout", label: "Log out", icon: LogOut },
];

export const otherNavItems: NavLeafItem[] = [
  { href: "/support", label: "Help Center", icon: BadgeQuestionMark },
  { href: "/profile", label: "Profile", icon: User },
];

export const pageTitleMap = new Map<string, string>([
  ...mainNavItems.flatMap((item) =>
    item.items
      ? item.items.map((sub) => [sub.href, sub.label] as [string, string])
      : item.href
        ? [[item.href, item.label] as [string, string]]
        : [],
  ),
  ...otherNavItems.map((item) => [item.href, item.label] as [string, string]),
]);
