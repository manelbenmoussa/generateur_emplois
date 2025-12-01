"use client";

// Logout is handled on the home page; sidebar should not perform sign out
import Link from "next/link";

interface TeacherSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function TeacherSidebar({
  activeView,
  onViewChange,
}: TeacherSidebarProps) {
  const mainMenuItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "timetable", icon: "📅", label: "My Timetable" },
    { id: "sessions", icon: "📚", label: "My Sessions" },
    { id: "availability", icon: "🗓️", label: "Availability" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col">
      <div className="p-6 text-white flex-1">
        <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Teacher Portal
        </h1>

        <div className="mb-8">
          <nav className="flex flex-col gap-2">
            {mainMenuItems.map((item) =>
              item.id === "home" ? (
                <Link
                  key={item.id}
                  href="/"
                  className={`inline-flex items-center gap-3 px-3 py-2 rounded-md transition transform text-white/90 hover:bg-white/10 hover:scale-105`}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition transform ${
                    activeView === item.id
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white/90 hover:bg-white/10 hover:scale-105"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            )}
          </nav>
        </div>

        {/* Profile is now part of mainMenuItems */}
      </div>

    </aside>
  );
}
