// Deprecated: Sessions are now managed in the main admin layout.
import { redirect } from "next/navigation";

export default function AdminSessionsPage() {
  redirect("/admin");
  return null;
}
