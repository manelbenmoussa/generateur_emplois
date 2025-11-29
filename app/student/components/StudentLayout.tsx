"use client";

import { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import DashboardView from "./DashboardView";
import TimetableView from "./TimetableView";
import MessagesView from "./MessagesView";
import DataView from "./DataView";
import SettingsView from "./SettingsView";

interface StudentLayoutProps {
  userName?: string | null;
  userId?: string;
}

type ViewType = "dashboard" | "timetable" | "messages" | "data" | "settings";

export default function StudentLayout({
  userName,
  userId,
}: StudentLayoutProps) {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <StudentSidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="w-3/4 p-8 overflow-y-auto">
        <section className="max-w-7xl mx-auto">
          {activeView === "dashboard" && (
            <DashboardView userName={userName} userId={userId} />
          )}
          {activeView === "timetable" && <TimetableView userId={userId} />}
          {activeView === "messages" && <MessagesView userId={userId} />}
          {activeView === "data" && <DataView userId={userId} />}
          {activeView === "settings" && <SettingsView userId={userId} />}
        </section>
      </main>
    </div>
  );
}
