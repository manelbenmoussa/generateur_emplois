import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminLayout from "./components/AdminLayout";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Server-side authentication and authorization
  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminLayout userName={session.user?.name} />;
}
