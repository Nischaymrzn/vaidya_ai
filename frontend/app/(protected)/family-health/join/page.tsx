"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { joinFamilyInvite } from "@/lib/actions/family-action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function FamilyJoinPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [relation, setRelation] = useState("")
  const [status, setStatus] = useState<"ready" | "pending" | "success" | "error">("ready")
  const [message, setMessage] = useState("Confirm your relation and join this family group.")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invite link is missing or invalid.")
    }
  }, [token])

  const handleJoin = async () => {
    if (!token) return
    setStatus("pending")
    setMessage("Joining family group...")
    const payload = relation.trim() ? { relation: relation.trim() } : undefined
    const result = await joinFamilyInvite(token, payload)
    if (!result.success || !result.data) {
      setStatus("error")
      setMessage(result.message || "Unable to join this family group.")
      return
    }
    setStatus("success")
    setMessage(`You have joined ${result.data.name}.`)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto w-full max-w-xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-0 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">Family invite</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Accept the invite to join the family health group.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
              {status === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 text-blue-600" />
              )}
              <p>{message}</p>
            </div>
            {status !== "success" && token ? (
              <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Relation (optional)
                </p>
                <Input
                  value={relation}
                  onChange={(event) => setRelation(event.target.value)}
                  placeholder="Self, Mother, Father, Spouse"
                  className="text-sm"
                />
                <Button
                  className="w-full rounded-full"
                  onClick={handleJoin}
                  disabled={status === "pending"}
                >
                  Join family group
                </Button>
              </div>
            ) : null}
            <Button asChild className="w-full rounded-full" variant={status === "success" ? "default" : "outline"}>
              <Link href="/family-health">Go to family health</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
