"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import DashboardView from "./DashboardView";
import TimetableGenerator from "./TimetableGenerator";
import RoomsCRUD from "../rooms/components/RoomsCRUD";
import SessionsCRUD from "./SessionsCRUD";
import StudentsCRUD from "../students/components/StudentsCRUD";
import SubjectsCRUD from "../subjects/components/SubjectsCRUD";

interface AdminLayoutProps {
  userName?: string | null;
}

export default function AdminLayout({ userName }: AdminLayoutProps) {
  const [activeView, setActiveView] = useState<
    "dashboard" | "generator" | "rooms" | "sessions" | "students" | "subjects"
  >("dashboard");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <AdminSidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="w-3/4 p-8">
        <section className="max-w-5xl mx-auto">
          {activeView === "dashboard" && <DashboardView userName={userName} />}
          {activeView === "generator" && <TimetableGenerator />}
          {activeView === "rooms" && <RoomsCRUD />}
          {activeView === "sessions" && <SessionsCRUD />}
          {activeView === "students" && <StudentsCRUD />}
          {activeView === "subjects" && <SubjectsCRUD />}
        </section>
      </main>
    </div>
  );
}
