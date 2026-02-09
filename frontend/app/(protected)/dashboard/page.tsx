import { getCurrentUser } from "@/lib/dal";
import { DashboardClient } from "./_components/dashboard-client";

export default async function OverviewPage() {
    const user = await getCurrentUser();

    return <DashboardClient userName={user?.name ?? ""} />
}