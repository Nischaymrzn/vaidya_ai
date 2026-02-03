import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileBackLink } from "../../_components/profile-back-link";

export default function ContactPage() {
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
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input placeholder="Subject" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea placeholder="Your message" rows={4} />
          </div>
          <Button className="bg-[#1F7AE0] hover:bg-[#1B6BB8]">Send</Button>
        </CardContent>
      </Card>
    </div>
  );
}
