"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProfileBackLink } from "../../_components/profile-back-link"

export default function ContactPage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const resolvedSubject = subject.trim() ? `Vaidya Support: ${subject.trim()}` : "Vaidya Support"
    const resolvedMessage = message.trim()
    const mailto = `mailto:nischaymaharjann@gmail.com?subject=${encodeURIComponent(
      resolvedSubject
    )}&body=${encodeURIComponent(resolvedMessage)}`
    window.location.href = mailto
  }

  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact us</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get in touch with support
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                placeholder="Subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                placeholder="Your message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
