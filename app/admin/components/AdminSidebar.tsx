"use client";

import Link from "next/link";

interface AdminSidebarProps {
  activeView: "dashboard" | "generator" | "rooms";
  onViewChange: (view: "dashboard" | "generator" | "rooms") => void;
}

export default function AdminSidebar({
  activeView,
  onViewChange,
}: AdminSidebarProps) {
  return (
    <aside className="w-1/4 min-h-screen bg-black/30 backdrop-blur-lg border-r border-white/10">
      <div className="p-6 text-white">
        <h1 className="text-lg font-bold mb-6">Admin Portal</h1>

        <nav className="flex flex-col gap-3">
          <Link
            href="/"
            className="text-white/90 hover:text-white transition hover:underline"
          >
            Home
          </Link>
          <button
            onClick={() => onViewChange("dashboard")}
            className={`text-left text-white/90 hover:text-white transition hover:underline ${
              activeView === "dashboard" ? "font-bold text-white" : ""
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => onViewChange("rooms")}
            className={`text-left text-white/90 hover:text-white transition hover:underline ${
              activeView === "rooms" ? "font-bold text-white" : ""
            }`}
          >
            🏫 Rooms
          </button>
          <Link
            href="/admin/sessions"
            className="text-white/90 hover:text-white transition hover:underline"
          >
            📅 Sessions
          </Link>
          <Link
            href="/admin/subjects"
            className="text-white/90 hover:text-white transition hover:underline"
          >
            📚 Subjects
          </Link>
          <Link
            href="/admin/teachers"
            className="text-white/90 hover:text-white transition hover:underline"
          >
            👨‍🏫 Teachers
          </Link>
          <Link
            href="/admin/students"
            className="text-white/90 hover:text-white transition hover:underline"
          >
            👨‍🎓 Students
          </Link>
          <button
            onClick={() => onViewChange("generator")}
            className={`text-left text-white/90 hover:text-white transition hover:underline ${
              activeView === "generator" ? "font-bold text-white" : ""
            }`}
          >
            ⚙️ Generate Timetable
          </button>
          <Link
            href="/admin/profile"
            className="text-white/90 hover:text-white transition hover:underline"
          >
            Profile
          </Link>
        </nav>
      </div>
    </aside>
  );
}
