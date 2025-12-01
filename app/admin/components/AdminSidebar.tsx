"use client";

import Link from "next/link";

interface AdminSidebarProps {
  activeView:
    | "dashboard"
    | "generator"
    | "rooms"
    | "sessions"
    | "students"
    | "subjects"
    | "teachers"
    | "specializations"
    | "departments"
    | "profile";
  onViewChange: (
    view:
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
  ) => void;
}

export default function AdminSidebar({
  activeView,
  onViewChange,
}: AdminSidebarProps) {
  return (
    <aside className="w-1/4 sticky top-0 h-screen bg-black/30 backdrop-blur-lg border-r border-white/10">
      <div className="p-6 text-white">
        <h1 className="text-lg font-bold mb-6">Admin Portal</h1>
        <nav className="flex flex-col gap-2">
          {/* Primary actions (high importance) */}
          <button
            onClick={() => onViewChange("dashboard")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${{
              true: "",
            }} ${
              activeView === "dashboard"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>📊</span>
            <span className="text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => onViewChange("generator")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "generator"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>⚙️</span>
            <span className="text-sm">Generate Timetable</span>
          </button>

          {/* Secondary actions */}
          <button
            onClick={() => onViewChange("sessions")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "sessions"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>📅</span>
            <span className="text-sm">Sessions</span>
          </button>

          <button
            onClick={() => onViewChange("teachers")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "teachers"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>👨‍🏫</span>
            <span className="text-sm">Teachers</span>
          </button>

          <button
            onClick={() => onViewChange("subjects")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "subjects"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>📚</span>
            <span className="text-sm">Subjects</span>
          </button>

          <button
            onClick={() => onViewChange("students")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "students"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>👨‍🎓</span>
            <span className="text-sm">Students</span>
          </button>

          {/* Tertiary / supporting actions */}
          <button
            onClick={() => onViewChange("rooms")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "rooms"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>🏫</span>
            <span className="text-sm">Rooms</span>
          </button>

          <button
            onClick={() => onViewChange("specializations")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "specializations"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>🧭</span>
            <span className="text-sm">Specializations</span>
          </button>

          <button
            onClick={() => onViewChange("departments")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
              activeView === "departments"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>🏷️</span>
            <span className="text-sm">Departments</span>
          </button>

          <button
            onClick={() => onViewChange("profile")}
            className={`flex items-center gap-3 px-3 py-2 rounded-md mt-2 transition transform ${
              activeView === "profile"
                ? "bg-white/10 font-semibold text-white"
                : "text-white/90 hover:bg-white/10 hover:scale-105"
            }`}
          >
            <span>👤</span>
            <span className="text-sm">Profile</span>
          </button>
        </nav>
        <div className="mt-6 px-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white hover:bg-white/6 px-3 py-2 rounded-md transition"
          >
            🏠 Home
          </Link>
        </div>
      </div>
    </aside>
  );
}
