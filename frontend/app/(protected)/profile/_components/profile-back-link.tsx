"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function ProfileBackLink() {
  return (
    <Link
      href="/profile"
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to profile
    </Link>
  );
}
