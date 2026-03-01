"use client";

import { useEffect, useState } from "react";
import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileBackLink } from "../../_components/profile-back-link";

const options = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
] as const;

export default function ThemePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? (theme ?? "light") : "light";

  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Theme</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your preferred appearance
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {options.map((option) => {
              const Icon = option.icon;
              const isActive = activeTheme === option.key;
              return (
                <Button
                  key={option.key}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className="justify-start gap-2"
                  onClick={() => setTheme(option.key)}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Active mode:{" "}
            <span className="font-medium text-foreground">
              {mounted ? resolvedTheme ?? "light" : "light"}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
