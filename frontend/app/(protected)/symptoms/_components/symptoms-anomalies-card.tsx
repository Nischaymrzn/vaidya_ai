"use client";

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SymptomsAnomaliesCard() {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
      <CardContent className="p-4">
        <Link
          href="/symptoms/anomalies"
          className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-[#1F7AE0]/40 hover:bg-[#1F7AE0]/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#1F7AE0]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Health Anomalies</p>
              <p className="text-xs text-slate-500">Analyze your health anomalies</p>
            </div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F7AE0] text-white transition group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
