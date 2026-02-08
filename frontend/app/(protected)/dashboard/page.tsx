import { getCurrentUser } from "@/lib/dal";
import { Logout } from "./_components/logout";

export default async function OverviewPage() {
    const user = await getCurrentUser();

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
            <p className="text-2xl font-semibold">I am dashboard page</p>
            <p className="text-muted-foreground">
                Hello, {user?.name}!
            </p>
            <Logout />
        </div>
    );
}