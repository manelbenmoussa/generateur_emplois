"use client";

import { useState } from "react";
import TeacherSidebar from "./TeacherSidebar";
import DashboardView from "./DashboardView";
import TimetableView from "./TimetableView";
import SessionsView from "./SessionsView";
import ProfileView from "./ProfileView";

interface TeacherLayoutProps {
  userName?: string | null;
  userId?: string;
}

type ViewType =
  | "dashboard"
  | "timetable"
  | "sessions"
  | "profile"
  | "availability";

export default function TeacherLayout({
  userName,
  userId,
}: TeacherLayoutProps) {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <TeacherSidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="w-3/4 p-8 overflow-y-auto">
        <section className="max-w-7xl mx-auto">
          {activeView === "dashboard" && <DashboardView userName={userName} />}
          {activeView === "timetable" && <TimetableView userId={userId} />}
          {activeView === "sessions" && <SessionsView userId={userId} />}
          {activeView === "profile" && <ProfileView userId={userId} />}
        </section>
      </main>
    </div>
  );
}
