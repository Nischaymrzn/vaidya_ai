import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProfileBackLink } from "../../_components/profile-back-link";

export default function PasswordPage() {
  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Password and security</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Change your password
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label>Confirm new password</Label>
            <Input type="password" placeholder="Confirm new password" />
          </div>
          <Button className="bg-[#1F7AE0] hover:bg-[#1B6BB8]">Update password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
