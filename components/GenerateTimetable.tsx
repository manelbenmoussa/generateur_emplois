"use client";

import { useState } from "react";

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

export default function GenerateTimetable() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TimetableResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
      <div className="flex flex-col items-center gap-6">
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
            <span>Open Printable Timetable</span>
          </a>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          Click to generate the optimized timetable. You can then open a
          printable version in a new tab.
        </p>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0"
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
              <h3 className="font-semibold text-red-800 dark:text-red-300">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {result.pdfPayload?.sessions?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sessions Scheduled
            </div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {new Set(result.pdfPayload?.sessions?.map((s) => s.teacher))
                .size || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Teachers
            </div>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
              {new Set(result.pdfPayload?.sessions?.map((s) => s.room)).size ||
                0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Rooms Used
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {result.pdfPayload?.school?.name || "N/A"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              School
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
