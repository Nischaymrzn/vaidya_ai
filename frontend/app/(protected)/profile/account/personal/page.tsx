import { getCurrentUser } from "@/lib/dal";
import { PersonalInfoForm } from "../../_components/personal-info-form";
import { ProfileBackLink } from "../../_components/profile-back-link";

export default async function PersonalInfoPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Personal information</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your profile details and photo
        </p>
      </div>
      <PersonalInfoForm user={user} />
    </div>
  );
}
