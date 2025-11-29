"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StudentSidebarProps {
  activeView: string;
  onViewChange: (view: any) => void;
}

export default function StudentSidebar({
  activeView,
  onViewChange,
}: StudentSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  const mainMenuItems = [
    { id: "dashboard", icon: "🏠", label: "Home" },
    { id: "timetable", icon: "📅", label: "Timetable" },
    { id: "messages", icon: "🔔", label: "Notifications" },
    { id: "data", icon: "📊", label: "Data" },
  ];

  const profileMenuItems = [{ id: "settings", icon: "⚙️", label: "Settings" }];

  return (
    <aside className="w-1/4 min-h-screen bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col">
      <div className="p-6 text-white flex-1">
        <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Student Portal
        </h1>

        <div className="mb-8">
          <nav className="flex flex-col gap-2">
            {mainMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? "bg-white/20 text-white font-semibold shadow-lg border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Profile
          </p>
          <nav className="flex flex-col gap-2">
            {profileMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? "bg-white/20 text-white font-semibold shadow-lg border border-white/30"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white transition-all duration-200 border border-red-500/30"
        >
          <span className="text-xl">🚪</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
