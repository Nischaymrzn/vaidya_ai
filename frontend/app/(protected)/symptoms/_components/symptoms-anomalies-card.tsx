"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SymptomsAnomaliesCard() {
  return (
    <Card className="rounded-3xl border border-primary/20 bg-primary text-primary-foreground shadow-sm py-4">
      <CardHeader className="pb-1.5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Health anomalies</CardTitle>
            <CardDescription className="text-sm text-primary-foreground/80">
              Find unusual symptom clusters fast.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
          Add symptoms and let the model highlight patterns that need attention.
        </div>
        <Button
          asChild
          className="w-full rounded-full bg-white text-primary hover:bg-white/90"
        >
          <Link href="/symptoms/anomalies" className="text-primary">
            Open anomalies tracker
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
