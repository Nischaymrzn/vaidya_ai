import { getCurrentUser } from "@/lib/dal";
import { ProfileBackLink } from "../../_components/profile-back-link";
import { PasswordForm } from "./_components/password-form";

export default async function PasswordPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <ProfileBackLink />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Password and security</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Change your password
        </p>
      </div>
      <PasswordForm user={user} />
    </div>
  );
}
