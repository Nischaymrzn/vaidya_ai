import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileBackLink } from "../../_components/profile-back-link";

export default function HealthCentrePage() {
  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Health centre</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find health centres near you
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Centres</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Health centre directory coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
