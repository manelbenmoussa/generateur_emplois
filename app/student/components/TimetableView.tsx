"use client";

import { useState, useEffect } from "react";

interface Session {
  id: number;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  weekDay: string;
}

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export default function TimetableView() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("current");

  useEffect(() => {
    fetchTimetable();
  }, [selectedWeek]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/student/sessions?week=${selectedWeek}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch timetable");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load timetable"
      );
    } finally {
      setLoading(false);
    }
  };

  const getSessionsForDayAndTime = (day: string, time: string) => {
    return sessions.filter((session) => {
      return session.weekDay === day && session.startTime === time;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading timetable...</div>
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

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            📅 Weekly Timetable
          </h2>
          <p className="text-gray-300">Your complete class schedule</p>
        </div>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="current">Current Week</option>
          <option value="next">Next Week</option>
        </select>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-4 text-left text-sm font-semibold text-white w-24">
                  Time
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-4 text-center text-sm font-semibold text-white"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr
                  key={time}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-300 align-top">
                    {time}
                  </td>
                  {weekDays.map((day) => {
                    const daySessions = getSessionsForDayAndTime(day, time);
                    return (
                      <td
                        key={`${day}-${time}`}
                        className="px-2 py-2 align-top"
                      >
                        {daySessions.length > 0 ? (
                          <div className="space-y-1">
                            {daySessions.map((session) => (
                              <div
                                key={session.id}
                                className="bg-gradient-to-br from-blue-600/80 to-purple-600/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 cursor-pointer shadow-lg"
                              >
                                <p className="text-white font-semibold text-sm mb-1">
                                  {session.subject}
                                </p>
                                <p className="text-xs text-gray-200 mb-1">
                                  👨‍🏫 {session.teacher}
                                </p>
                                <p className="text-xs text-gray-200 mb-1">
                                  📍 {session.room}
                                </p>
                                <p className="text-xs text-gray-300 font-mono">
                                  {session.startTime} - {session.endTime}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-20"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 items-center text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded"></div>
          <span>Regular Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
          <span>Free Period</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-1">Total Classes</p>
          <p className="text-2xl font-bold text-white">{sessions.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-white">
            {sessions.length * 1}h
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-1">Free Days</p>
          <p className="text-2xl font-bold text-white">
            {weekDays.length - new Set(sessions.map((s) => s.weekDay)).size}
          </p>
        </div>
      </div>
    </>
  );
}
