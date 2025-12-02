"use client";

import { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import DashboardView from "./DashboardView";
import TimetableView from "./TimetableView";
import SettingsView from "./SettingsView";

interface StudentLayoutProps {
  userName?: string | null;
  userId?: string;
}

type ViewType = "home" | "timetable" | "profile";

export default function StudentLayout({
  userName,
  userId,
}: StudentLayoutProps) {
  // Start directly on the timetable to avoid the home landing page
  const [activeView, setActiveView] = useState<ViewType>("timetable");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <StudentSidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="w-3/4 p-8 overflow-y-auto">
        <section className="max-w-7xl mx-auto">
          {activeView === "home" && (
            <DashboardView userName={userName} userId={userId} />
          )}
          {activeView === "timetable" && <TimetableView userId={userId} />}
          {activeView === "profile" && <SettingsView />}
        </section>
      </main>
    </div>
  );
}
