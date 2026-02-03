import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-6 text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The user you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild className="w-full bg-[#1F7AE0] hover:bg-[#1B6BB8]">
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
