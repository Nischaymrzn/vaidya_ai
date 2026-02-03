import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileBackLink } from "../../_components/profile-back-link";

export default function ThemePage() {
  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Theme</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Choose your preferred appearance
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Theme settings coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
