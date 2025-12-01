"use client";

import { useState, useEffect } from "react";

interface PdfSession {
  id: number | string;
  subject: string;
  teacher: string;
  group: string;
  specialization: string;
  room: string;
  dateTime: string;
}

interface TimetableResult {
  pdfPayload: {
    school: {
      name: string;
      address: string | null;
    };
    sessions: PdfSession[];
  };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface ScheduleConfig {
  days: string[];
  timeSlots: TimeSlot[];
}

export default function TimetableGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TimetableResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(
    null
  );
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newDay, setNewDay] = useState<string>("");
  const [newSlotStart, setNewSlotStart] = useState<string>("");
  const [newSlotEnd, setNewSlotEnd] = useState<string>("");
  const [info, setInfo] = useState<string | null>(null);

  const handleGenerateTimetable = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-timetable");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate timetable");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current schedule config on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/schedule-config");
        if (!res.ok) return;
        const json = (await res.json()) as { scheduleConfig?: ScheduleConfig };
        setScheduleConfig(json.scheduleConfig ?? null);
        if (json.scheduleConfig) {
          setDays(
            Array.isArray(json.scheduleConfig.days)
              ? json.scheduleConfig.days
              : []
          );
          setTimeSlots(
            Array.isArray(json.scheduleConfig.timeSlots)
              ? json.scheduleConfig.timeSlots
              : []
          );
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleSaveScheduleConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      // use structured days/timeSlots instead of raw JSON
      if (!Array.isArray(days) || days.length === 0) {
        throw new Error("Please add at least one day.");
      }
      if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
        throw new Error("Please add at least one time slot.");
      }
      const res = await fetch("/api/schedule-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, timeSlots }),
      });
      const data = (await res.json()) as {
        scheduleConfig?: ScheduleConfig;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setScheduleConfig({ days, timeSlots });
      setInfo("Schedule config saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          📅 Timetable Generator
        </h2>
        <p className="text-gray-200">
          Generate optimized schedules with AI-powered algorithms
        </p>
      </div>

      {/* Main Generator Card */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 mb-8">
        {/* Schedule configuration editor */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white">Schedule Config</h4>
          <p className="text-sm text-gray-300 mb-2">
            Adjust weekdays and time slots used by the generator.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Days</label>
              <div className="flex gap-2 items-center mb-2">
                <input
                  value={newDay}
                  placeholder="e.g. Monday"
                  onChange={(e) => setNewDay(e.target.value)}
                  className="px-2 py-1 rounded bg-white/5 text-white flex-1"
                />
                <button
                  onClick={() => {
                    if (!newDay.trim()) return;
                    if (days.includes(newDay.trim())) {
                      setError("Day already added");
                      return;
                    }
                    setDays((d) => [...d, newDay.trim()]);
                    setNewDay("");
                    setError(null);
                  }}
                  className="px-3 py-1 bg-green-600 rounded text-white"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <div
                    key={d}
                    className="px-3 py-1 rounded bg-white/5 text-white flex items-center gap-2"
                  >
                    <span>{d}</span>
                    <button
                      onClick={() =>
                        setDays((prev) => prev.filter((x) => x !== d))
                      }
                      className="text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300">Time Slots</label>
              <div className="flex gap-2 items-center mb-2">
                <input
                  value={newSlotStart}
                  onChange={(e) => setNewSlotStart(e.target.value)}
                  placeholder="Start e.g. 08:15"
                  className="px-2 py-1 rounded bg-white/5 text-white w-1/2"
                />
                <input
                  value={newSlotEnd}
                  onChange={(e) => setNewSlotEnd(e.target.value)}
                  placeholder="End e.g. 09:45"
                  className="px-2 py-1 rounded bg-white/5 text-white w-1/2"
                />
                <button
                  onClick={() => {
                    const start = newSlotStart.trim();
                    const end = newSlotEnd.trim();
                    const timeRegex = /^\d{2}:\d{2}$/;
                    if (!timeRegex.test(start) || !timeRegex.test(end)) {
                      setError("Invalid time format, use HH:MM");
                      return;
                    }
                    // ensure start < end
                    const toMinutes = (t: string) => {
                      const [h, m] = t.split(":");
                      return Number(h) * 60 + Number(m);
                    };
                    if (toMinutes(start) >= toMinutes(end)) {
                      setError("Start time must be before end time");
                      return;
                    }
                    setTimeSlots((ts) => [
                      ...ts,
                      { startTime: start, endTime: end },
                    ]);
                    setNewSlotStart("");
                    setNewSlotEnd("");
                    setError(null);
                  }}
                  className="px-3 py-1 bg-green-600 rounded text-white"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {timeSlots.map((slot, idx) => (
                  <div
                    key={`${slot.startTime}-${slot.endTime}-${idx}`}
                    className="flex items-center justify-between bg-white/5 p-2 rounded"
                  >
                    <div>
                      {slot.startTime} — {slot.endTime}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setTimeSlots((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSaveScheduleConfig}
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              Save Schedule Config
            </button>
            <button
              onClick={() => {
                setDays([
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                ]);
                setTimeSlots([
                  { startTime: "08:15", endTime: "09:45" },
                  { startTime: "10:00", endTime: "11:30" },
                ]);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Load Defaults
            </button>
          </div>
          {/* Inline validation / info */}
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          {info && <p className="mt-3 text-sm text-green-300">{info}</p>}
          {/* Preview of current config so the user sees the saved state */}
          {scheduleConfig && (
            <div className="mt-4 p-3 bg-white/5 rounded">
              <div className="text-sm text-gray-300">
                Saved days: {JSON.stringify(scheduleConfig.days)}
              </div>
              <div className="text-sm text-gray-300">
                Saved time slots: {JSON.stringify(scheduleConfig.timeSlots)}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-6">
          {/* Generate Button */}
          <button
            onClick={handleGenerateTimetable}
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Generate Timetable</span>
              </>
            )}
          </button>

          {/* Download PDF Button - shown after generation */}
          {result && (
            <a
              href="/api/download-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Download PDF Timetable</span>
            </a>
          )}

          {/* Info Text */}
          <p className="text-sm text-gray-300 text-center max-w-md">
            Click the button to generate an optimized timetable for all
            sessions, teachers, and rooms in the system.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-300 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-200">Error</h3>
                <p className="text-red-100">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-500/20 border border-green-400/50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-300 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-green-200">Success!</h3>
                  <p className="text-green-100">
                    Timetable generated successfully
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-500/20 border border-blue-400/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-200">
                  {result.pdfPayload?.sessions?.length || 0}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  Sessions Scheduled
                </div>
              </div>
              <div className="bg-purple-500/20 border border-purple-400/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-200">
                  {result.pdfPayload?.school?.name || "N/A"}
                </div>
                <div className="text-sm text-gray-300 mt-1">School</div>
              </div>
              <div className="bg-indigo-500/20 border border-indigo-400/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-indigo-200">
                  {new Set(result.pdfPayload?.sessions?.map((s) => s.teacher))
                    .size || 0}
                </div>
                <div className="text-sm text-gray-300 mt-1">Teachers</div>
              </div>
              <div className="bg-pink-500/20 border border-pink-400/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-pink-200">
                  {new Set(result.pdfPayload?.sessions?.map((s) => s.room))
                    .size || 0}
                </div>
                <div className="text-sm text-gray-300 mt-1">Rooms Used</div>
              </div>
            </div>

            {/* Sessions Preview */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Schedule Preview
              </h3>
              <div className="max-h-96 overflow-y-auto border border-white/20 rounded-lg">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-black/30 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Group
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Room
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {result.pdfPayload?.sessions
                      ?.slice(0, 50)
                      .map((session, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-white/10 transition"
                        >
                          <td className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">
                            {session.dateTime}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-200">
                            {session.subject}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-200">
                            {session.teacher}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-200">
                            {session.group}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-200">
                            {session.room}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {result.pdfPayload?.sessions?.length > 50 && (
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Showing first 50 of {result.pdfPayload.sessions.length}{" "}
                  sessions
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
