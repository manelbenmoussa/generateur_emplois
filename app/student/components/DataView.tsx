"use client";

import { useState, useEffect } from "react";

interface Exam {
  id: number;
  subject: string;
  date: string;
  time: string;
  room: string;
  duration: number;
  grade?: number;
  maxGrade: number;
  status: "upcoming" | "completed" | "graded";
}

interface Absence {
  id: number;
  date: string;
  subject: string;
  reason?: string;
  justified: boolean;
  status: "pending" | "approved" | "rejected";
}

export default function DataView() {
  const [activeTab, setActiveTab] = useState<"exams" | "grades" | "absences">(
    "exams"
  );
  const [exams, setExams] = useState<Exam[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (activeTab === "exams" || activeTab === "grades") {
        const response = await fetch("/api/student/exams");
        if (!response.ok) throw new Error("Failed to fetch exams");
        const data = await response.json();
        setExams(data.exams || []);
      } else if (activeTab === "absences") {
        const response = await fetch("/api/student/absences");
        if (!response.ok) throw new Error("Failed to fetch absences");
        const data = await response.json();
        setAbsences(data.absences || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const upcomingExams = exams.filter((e) => e.status === "upcoming");
  const gradedExams = exams.filter((e) => e.status === "graded");
  const averageGrade =
    gradedExams.length > 0
      ? (
          gradedExams.reduce((sum, e) => sum + (e.grade || 0), 0) /
          gradedExams.length
        ).toFixed(2)
      : "N/A";

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">📊 Academic Data</h2>
        <p className="text-gray-300">Exams, grades, and attendance records</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("exams")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "exams"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          📝 Exams
        </button>
        <button
          onClick={() => setActiveTab("grades")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "grades"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          📈 Grades
        </button>
        <button
          onClick={() => setActiveTab("absences")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "absences"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          ⚠️ Absences
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading data...</div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
          <p className="text-red-200">{error}</p>
        </div>
      ) : (
        <>
          {/* Exams Tab */}
          {activeTab === "exams" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Upcoming Exams</p>
                  <p className="text-3xl font-bold text-white">
                    {upcomingExams.length}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">
                    {exams.length - upcomingExams.length}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Average Grade</p>
                  <p className="text-3xl font-bold text-white">
                    {averageGrade}
                  </p>
                </div>
              </div>

              {/* Exams List */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Upcoming Exams
                  </h3>
                  {upcomingExams.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No upcoming exams
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingExams.map((exam) => (
                        <div
                          key={exam.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-semibold text-lg mb-2">
                                {exam.subject}
                              </h4>
                              <div className="space-y-1 text-sm text-gray-300">
                                <p>
                                  📅{" "}
                                  {new Date(exam.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                                <p>
                                  🕐 {exam.time} ({exam.duration} min)
                                </p>
                                <p>📍 {exam.room}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                              {exam.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === "grades" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Average</p>
                  <p className="text-3xl font-bold text-white">
                    {averageGrade}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Highest</p>
                  <p className="text-3xl font-bold text-white">
                    {gradedExams.length > 0
                      ? Math.max(...gradedExams.map((e) => e.grade || 0))
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Lowest</p>
                  <p className="text-3xl font-bold text-white">
                    {gradedExams.length > 0
                      ? Math.min(...gradedExams.map((e) => e.grade || 0))
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Total Exams</p>
                  <p className="text-3xl font-bold text-white">
                    {gradedExams.length}
                  </p>
                </div>
              </div>

              {/* Grades List */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Grades
                  </h3>
                  {gradedExams.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No grades available yet
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                              Subject
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                              Date
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-white">
                              Grade
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-white">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {gradedExams.map((exam) => {
                            const percentage =
                              ((exam.grade || 0) / exam.maxGrade) * 100;
                            const gradeColor =
                              percentage >= 70
                                ? "text-green-400"
                                : percentage >= 50
                                ? "text-yellow-400"
                                : "text-red-400";
                            return (
                              <tr key={exam.id} className="hover:bg-white/5">
                                <td className="px-4 py-3 text-white">
                                  {exam.subject}
                                </td>
                                <td className="px-4 py-3 text-gray-300 text-sm">
                                  {new Date(exam.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </td>
                                <td
                                  className={`px-4 py-3 text-center font-bold ${gradeColor}`}
                                >
                                  {exam.grade}/{exam.maxGrade}
                                </td>
                                <td
                                  className={`px-4 py-3 text-center font-bold ${gradeColor}`}
                                >
                                  {percentage.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Absences Tab */}
          {activeTab === "absences" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Total Absences</p>
                  <p className="text-3xl font-bold text-white">
                    {absences.length}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Justified</p>
                  <p className="text-3xl font-bold text-green-400">
                    {absences.filter((a) => a.justified).length}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <p className="text-gray-300 text-sm mb-1">Unjustified</p>
                  <p className="text-3xl font-bold text-red-400">
                    {absences.filter((a) => !a.justified).length}
                  </p>
                </div>
              </div>

              {/* Absences List */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Absence Records
                  </h3>
                  {absences.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No absences recorded
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {absences.map((absence) => (
                        <div
                          key={absence.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold">
                                  {absence.subject}
                                </h4>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    absence.justified
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-red-500/20 text-red-300"
                                  }`}
                                >
                                  {absence.justified
                                    ? "Justified"
                                    : "Unjustified"}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    absence.status === "approved"
                                      ? "bg-green-500/20 text-green-300"
                                      : absence.status === "rejected"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {absence.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mb-1">
                                📅{" "}
                                {new Date(absence.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                              {absence.reason && (
                                <p className="text-sm text-gray-400">
                                  Reason: {absence.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
