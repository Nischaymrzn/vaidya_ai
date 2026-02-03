import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to users page as the default admin view
  redirect("/admin/users");
}
