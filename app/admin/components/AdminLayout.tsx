"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import DashboardView from "./DashboardView";
import TimetableGenerator from "./TimetableGenerator";
import RoomsCRUD from "../rooms/components/RoomsCRUD";
import SessionsCRUD from "./SessionsCRUD";
import StudentsCRUD from "../students/components/StudentsCRUD";
import SubjectsCRUD from "../subjects/components/SubjectsCRUD";
import TeachersCRUD from "../teachers/components/TeachersCRUD";
import SpecializationsCRUD from "../specializations/components/SpecializationsCRUD";
import DepartmentsCRUD from "../departments/components/DepartmentsCRUD";
import AdminProfile from "./AdminProfile";

interface AdminLayoutProps {
  userName?: string | null;
}

export default function AdminLayout({ userName }: AdminLayoutProps) {
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "generator"
    | "rooms"
    | "sessions"
    | "students"
    | "subjects"
    | "teachers"
    | "specializations"
    | "departments"
    | "profile"
  >("dashboard");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <AdminSidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="w-3/4 p-8 h-screen overflow-auto">
        <section className="max-w-5xl mx-auto">
          {activeView === "dashboard" && (
            <DashboardView userName={userName} onNavigate={setActiveView} />
          )}
          {activeView === "generator" && <TimetableGenerator />}
          {activeView === "rooms" && <RoomsCRUD />}
          {activeView === "sessions" && <SessionsCRUD />}
          {activeView === "students" && <StudentsCRUD />}
          {activeView === "subjects" && <SubjectsCRUD />}
          {activeView === "teachers" && <TeachersCRUD />}
          {activeView === "specializations" && <SpecializationsCRUD />}
          {activeView === "departments" && <DepartmentsCRUD />}
          {activeView === "profile" && <AdminProfile />}
        </section>
      </main>
    </div>
  );
}
