import { getCurrentUser } from "@/lib/dal";
import { Logout } from "./_components/logout";

export default async function OverviewPage() {
    const user = await getCurrentUser();

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-4" >
            <p>Dashboard Page</p>

            <p>
                Hello, {user?.name}!
            </p>

            <Logout />
        </div >
    );
}