"use client";

import { useEffect, useState } from "react";

interface DashboardViewProps {
  userName?: string | null;
  userId?: string;
}

interface DashboardStats {
  totalHours: number;
  attendedHours: number;
  upcomingSessions: number;
  pendingExams: number;
}

interface TodaySession {
  id: number;
  time: string;
  subject: string;
  room: string;
  teacher: string;
  status: string;
}

export default function DashboardView({
  userName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId,
}: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setStats(data.stats ?? null);
        setTodaySessions(data.todaySessions ?? []);
      } catch {
        // ignore errors
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome, {userName}</h2>
      </div>

      <style jsx>{`
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .stat-card h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }
        .stat-card .value {
          font-size: 28px;
          color: #fff;
          font-weight: 700;
        }
        .sessions-list {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
        }
        .session-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .session-item:last-child {
          border-bottom: none;
        }
      `}</style>

      {/* Stats Cards */}
      <div className="cards">
        <div className="stat-card">
          <h4>Total Hours</h4>
          <div className="value">{stats?.totalHours ?? 0}</div>
        </div>
        <div className="stat-card">
          <h4>Attended Hours</h4>
          <div className="value">{stats?.attendedHours ?? 0}</div>
        </div>
        <div className="stat-card">
          <h4>Today&apos;s Sessions</h4>
          <div className="value">{stats?.upcomingSessions ?? 0}</div>
        </div>
        <div className="stat-card">
          <h4>Pending Exams</h4>
          <div className="value">{stats?.pendingExams ?? 0}</div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="sessions-list">
        <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Schedule</h3>
        {todaySessions.length === 0 ? (
          <p className="text-gray-400">No sessions scheduled for today</p>
        ) : (
          todaySessions.map((session) => (
            <div key={session.id} className="session-item">
              <div>
                <span className="text-white font-medium">{session.subject}</span>
                <span className="text-gray-400 ml-2">· {session.teacher}</span>
              </div>
              <div className="text-gray-300">
                {session.time} · {session.room}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
