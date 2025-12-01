"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherLayout from "./components/TeacherLayout";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user?.role !== "TEACHER") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading" || session?.user?.role !== "TEACHER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <TeacherLayout userName={session.user?.name} userId={session.user?.id} />
  );
}
