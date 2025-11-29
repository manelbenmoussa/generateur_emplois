"use client";

import { useState, useEffect } from "react";

interface DashboardViewProps {
  userName?: string | null;
  userId?: string;
}

interface Stats {
  totalHours: number;
  attendedHours: number;
  upcomingSessions: number;
  pendingExams: number;
}

interface Session {
  id: number;
  time: string;
  subject: string;
  room: string;
  teacher: string;
  status: string;
}

export default function DashboardView({
  userName,
  userId,
}: DashboardViewProps) {
  const [stats, setStats] = useState<Stats>({
    totalHours: 0,
    attendedHours: 0,
    upcomingSessions: 0,
    pendingExams: 0,
  });

  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/dashboard");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setStats(data.stats);
      setTodaySessions(data.todaySessions);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  const attendancePercentage =
    stats.totalHours > 0 ? (stats.attendedHours / stats.totalHours) * 100 : 0;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome, {userName}! 👋
        </h2>
        <p className="text-gray-300">Here's your overview for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 text-sm font-medium">Total Hours</h3>
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalHours}h</p>
          <p className="text-xs text-gray-400 mt-1">This week</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 text-sm font-medium">Attendance</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {attendancePercentage.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.attendedHours}/{stats.totalHours} hours
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 text-sm font-medium">Upcoming</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.upcomingSessions}
          </p>
          <p className="text-xs text-gray-400 mt-1">Sessions today</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 text-sm font-medium">Exams</h3>
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.pendingExams}</p>
          <p className="text-xs text-gray-400 mt-1">Upcoming</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Today's Schedule
            </h3>
            <span className="text-sm text-gray-300">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {todaySessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">🎉 No classes today!</p>
              <p className="text-sm">Enjoy your free day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-blue-300">
                          {session.time}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                          {session.status}
                        </span>
                      </div>
                      <h4 className="text-white font-semibold text-lg mb-1">
                        {session.subject}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>📍 {session.room}</span>
                        <span>👨‍🏫 {session.teacher}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between">
                <span>📅 View Full Timetable</span>
                <span>→</span>
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between">
                <span>🔔 Check Notifications</span>
                <span>→</span>
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between">
                <span>📝 View Exams</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-200 mb-1">
                  📢 New announcement
                </p>
                <p className="text-xs text-gray-300">
                  Math exam scheduled for next week
                </p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-200 mb-1">✅ Grade posted</p>
                <p className="text-xs text-gray-300">
                  Physics assignment - 95/100
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200 mb-1">⚠️ Reminder</p>
                <p className="text-xs text-gray-300">Assignment due tomorrow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
