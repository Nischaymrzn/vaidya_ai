import { getCurrentUser } from "@/lib/dal";
import { ProfileOverview } from "./_components/profile-overview";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return <ProfileOverview user={user} />;
}
