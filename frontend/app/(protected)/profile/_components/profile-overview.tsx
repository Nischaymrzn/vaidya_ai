"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TUser } from "@/lib/definition";
import {
  User,
  Lock,
  Bell,
  Palette,
  Heart,
  Building2,
  Mail,
  LogOut,
  Trash2,
} from "lucide-react";

interface ProfileOverviewProps {
  user: TUser;
}

const accountLinks = [
  {
    href: "/profile/account/personal",
    label: "Personal information",
    icon: User,
  },
  {
    href: "/profile/account/password",
    label: "Password and security",
    icon: Lock,
  },
];

const generalLinks = [
  { href: "/profile/general/notification", label: "Notification", icon: Bell },
  { href: "/profile/general/theme", label: "Theme", icon: Palette },
  { href: "/profile/general/health", label: "Health preferences", icon: Heart },
];

const supportLinks = [
  {
    href: "/profile/support/health-centre",
    label: "Health centre",
    icon: Building2,
  },
  { href: "/profile/support/contact", label: "Contact us", icon: Mail },
];

export function ProfileOverview({ user }: ProfileOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar
          className="h-24 w-24 rounded-full ring-1 ring-border shadow-sm"
        >
          <AvatarImage
            src={user.profilePicture}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback
            className="text-3xl font-semibold bg-muted text-muted-foreground"
          >
            {user.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          {user.number && (
            <p className="text-sm text-muted-foreground mt-1">{user.number}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <link.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {generalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <link.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-base">Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {supportLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <link.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
            <Link
              href="/profile/support/logout"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Log out</span>
            </Link>
            <Link
              href="/profile/support/delete"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Delete account</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
