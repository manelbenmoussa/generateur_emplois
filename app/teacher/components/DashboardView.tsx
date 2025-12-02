"use client";

import { useEffect, useState } from "react";

interface DashboardViewProps {
  userName?: string | null;
  userId?: string;
  onNavigate?: (
    view: "dashboard" | "timetable" | "specializations" | "profile"
  ) => void;
}

type TeacherSession = { scheduled_weekday?: string | null };

export default function DashboardView({
  userName,
  userId,
  onNavigate,
}: DashboardViewProps) {
  const [stats, setStats] = useState<{
    scheduled?: number;
    today?: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!userId) return;
      try {
        // Fetch teacher timetable and compute some simple stats
        const res = await fetch(
          `/api/teacher/timetable?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const sessions: TeacherSession[] = data.sessions ?? [];
        const scheduled = sessions.length;
        // scheduled_weekday is stored as uppercase names (e.g. 'MONDAY','TUESDAY')
        // Use a fixed mapping from getDay() to avoid locale differences.
        const WEEKDAYS = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ];
        const todayName = WEEKDAYS[new Date().getDay()];
        const today = sessions.filter(
          (s) => (s.scheduled_weekday ?? "").toUpperCase() === todayName
        ).length;
        setStats({ scheduled, today });
      } catch {
        // ignore errors — keep UI minimal
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome, {userName}</h2>
      </div>

      <style jsx>{`
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .nav-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 28px;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .nav-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
        }
        .nav-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #fff;
          font-weight: 600;
        }
        .nav-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }
      `}</style>

      <div className="cards">
        <button
          onClick={() => onNavigate?.("timetable")}
          className="nav-card text-left"
          aria-label="Go to timetable"
        >
          <div className="icon">📅</div>
          <h3>My Timetable</h3>
          <p>Quick access to your weekly schedule</p>
        </button>

        <button
          onClick={() => onNavigate?.("specializations")}
          className="nav-card text-left"
          aria-label="Go to specializations"
        >
          <div className="icon">🧭</div>
          <h3>Specializations</h3>
          <p>View subjects for your specialization</p>
        </button>

        <div className="nav-card text-left">
          <div className="icon">📊</div>
          <h3>Stats</h3>
          <p>
            Scheduled sessions: {stats?.scheduled ?? "—"} · Today:{" "}
            {stats?.today ?? "—"}
          </p>
        </div>
      </div>
    </>
  );
}
