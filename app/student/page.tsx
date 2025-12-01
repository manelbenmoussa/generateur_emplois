"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudentLayout from "./components/StudentLayout";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user?.role !== "STUDENT") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading" || session?.user?.role !== "STUDENT") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <StudentLayout userName={session.user?.name} userId={session.user?.id} />
  );
}
