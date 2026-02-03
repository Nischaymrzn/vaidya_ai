import { getCurrentUser } from "@/lib/dal";
import { DeleteAccountCard } from "../../_components/delete-account-card";
import { ProfileBackLink } from "../../_components/profile-back-link";

export default async function DeleteAccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Delete account</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Permanently remove your account
        </p>
      </div>
      <DeleteAccountCard user={user} />
    </div>
  );
}
