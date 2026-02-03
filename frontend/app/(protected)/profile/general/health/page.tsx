import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileBackLink } from "../../_components/profile-back-link";

export default function HealthPreferencesPage() {
  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Health preferences</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your health-related settings
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Health preferences coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
