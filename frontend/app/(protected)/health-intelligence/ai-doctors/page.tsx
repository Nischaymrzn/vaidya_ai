"use client"

import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AI_DOCTOR_CATALOG } from "@/lib/ai-catalog"

export default function AiDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return AI_DOCTOR_CATALOG
    return AI_DOCTOR_CATALOG.filter((doctor) => {
      const haystack = [
        doctor.name,
        doctor.title,
        ...doctor.tags,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-6">

          <Card className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary via-primary/90 to-primary text-white shadow-sm dark:border-border dark:bg-[linear-gradient(135deg,oklch(0.21_0_0)_0%,oklch(0.18_0_0)_100%)]">
            <CardContent className="p-0">
              <div className="grid gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-2">

                  <h2 className="text-2xl font-semibold">
                    Start a guided health consult
                  </h2>
                  <p className="text-sm text-white/80">
                    Each doctor focuses on a specialty with tailored prompts and next-step advice.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <Button
                    asChild
                    className="h-10 rounded-full bg-white text-primary shadow-sm hover:bg-white/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
                  >
                    <Link href="/ai-assistant">Open Vaidya.ai</Link>
                  </Button>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex flex-col gap-3 rounded-2xl bg-white/95 p-2 shadow-sm backdrop-blur sm:flex-row sm:items-center dark:bg-muted/40">
                  <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-7 border-0 p-0 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                      placeholder="Search a doctor or specialty..."
                    />
                  </div>
                  <Button className="h-10 rounded-xl bg-primary text-white hover:bg-primary/90">
                    Find Doctor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => {
              return (
                <Card key={doctor.id} className="rounded-2xl border border-border bg-card shadow-sm">
                  <CardContent className="space-y-4 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-border bg-muted/50">
                        <Image
                          src={doctor.image}
                          alt={doctor.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold text-foreground">
                          {doctor.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {doctor.title}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {doctor.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        className="h-9 flex-1 rounded-md bg-primary text-white hover:bg-primary/90"
                      >
                        <Link href={`/health-intelligence/ai-doctors/consult?doctor=${doctor.id}`}>
                          Start consult
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredDoctors.length === 0 && (
            <Card className="rounded-2xl border border-dashed border-border bg-card">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No doctors found. Try a different search.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
