import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-4">
      <p>I am Landing Page</p>
      <Link href="/login">
        <Button>Login Page</Button>
      </Link>
    </div>
  );
}
