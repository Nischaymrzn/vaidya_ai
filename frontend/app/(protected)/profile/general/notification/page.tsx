"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notification-action"
import { TNotification } from "@/lib/definition"
import { cn } from "@/lib/utils"
import { ProfileBackLink } from "../../_components/profile-back-link"

const formatNotificationTime = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<TNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [markAllPending, startMarkAllTransition] = useTransition()
  const unreadCount = notifications.filter((item) => !item.read).length

  const loadNotifications = async () => {
    setLoading(true)
    const result = await getNotifications({ page: 1, limit: 20 })
    if (result.success && result.data) {
      setNotifications(result.data)
    } else {
      setNotifications([])
    }
    setLoading(false)
  }

  useEffect(() => {
    void loadNotifications()
  }, [])

  const handleNotificationClick = (notification: TNotification) => {
    if (notification.read) return
    setNotifications((prev) =>
      prev.map((item) =>
        item._id === notification._id ? { ...item, read: true } : item
      )
    )
    void markNotificationRead(notification._id)
  }

  const handleMarkAllRead = () => {
    if (!unreadCount) return
    startMarkAllTransition(async () => {
      const result = await markAllNotificationsRead()
      if (result.success) {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
      }
    })
  }

  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Recent updates from your care workspace.
          </p>
        </div>
        <Button
          variant="ghost"
          className="h-8 rounded-full px-3 text-xs"
          disabled={loading || markAllPending || unreadCount === 0}
          onClick={handleMarkAllRead}
        >
          Mark all as read
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">
            Recent
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="px-4 py-6 text-xs text-muted-foreground">Loading notifications...</div>
          ) : notifications.length ? (
            <div className="divide-y divide-border/60">
              {notifications.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/30"
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 rounded-full",
                      item.read ? "bg-muted-foreground/40" : "bg-foreground"
                    )}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p
                      className={cn(
                        "text-sm text-foreground",
                        item.read ? "font-medium" : "font-semibold"
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.message}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {formatNotificationTime(item.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-xs text-muted-foreground">No notifications yet.</div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-xs font-semibold text-foreground underline-offset-4 hover:underline">
          View all notifications
        </Link>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Push notifications</Label>
              <p className="text-sm text-muted-foreground">Receive browser notifications</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
