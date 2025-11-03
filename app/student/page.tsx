"use client";
import Link from "next/link";
import React from "react";

export default function StudentPage() {
  const brown = "#8B5E3C"; // warm brown accent

  return (
    <div className="min-h-screen flex">
      {/* Left sidebar 25% - black background */}
      <aside className="w-1/4 min-h-screen" style={{ backgroundColor: "#000" }}>
        <div className="p-6 text-white">
          <h1 className="text-lg font-bold mb-6">My Student Page</h1>

          <nav className="flex flex-col gap-3">
            <Link href="/" className="text-white/90 hover:underline">
              Home
            </Link>
            <Link
              href="/student/profile"
              className="text-white/90 hover:underline"
            >
              Profile
            </Link>
            <Link
              href="/student/timetable"
              className="text-white/90 hover:underline"
            >
              My Timetable
            </Link>
            <Link
              href="/student/sessions"
              className="text-white/90 hover:underline"
            >
              My Sessions
            </Link>
            <Link
              href="/student/notifications"
              className="text-white/90 hover:underline"
            >
              Notifications
            </Link>
            <Link
              href="/student/settings"
              className="text-white/90 hover:underline"
            >
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Right content 75% - white background */}
      <main className="w-3/4 bg-white p-8">
        <section className="max-w-5xl mx-auto">
          {/* Page title area (left of page already shows name in sidebar top) */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: brown }}>
              Welcome, Student
            </h2>
            <p className="text-sm" style={{ color: brown }}>
              Below is your personal dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 p-5 border rounded"
              style={{ borderColor: brown }}
            >
              <h3 className="font-semibold mb-3" style={{ color: brown }}>
                My Timetable
              </h3>
              <div
                className="border rounded p-4 text-sm"
                style={{ color: brown }}
              >
                {/* Placeholder timetable — replace with TimetableGrid component */}
                <p>Today: Monday</p>
                <ul className="mt-2 space-y-2">
                  <li className="p-2 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">08:00 - 09:30</div>
                      <div className="text-sm" style={{ color: brown }}>
                        Mathematics — Room 101 — Group A
                      </div>
                    </div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: brown }}
                    >
                      In class
                    </div>
                  </li>
                  <li className="p-2 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">09:45 - 11:15</div>
                      <div className="text-sm" style={{ color: brown }}>
                        Physics — Room 202 — Group B
                      </div>
                    </div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: brown }}
                    >
                      Upcoming
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <aside
              className="p-5 border rounded"
              style={{ borderColor: brown }}
            >
              <h3 className="font-semibold mb-3" style={{ color: brown }}>
                Hours & Availability
              </h3>
              <div className="mb-3">
                <div className="text-sm" style={{ color: brown }}>
                  Assigned hours this week
                </div>
                <div className="text-xl font-bold" style={{ color: brown }}>
                  12 / 16 h
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2" style={{ color: brown }}>
                  Availability
                </h4>
                <div className="text-sm" style={{ color: brown }}>
                  You are available for today
                </div>
              </div>
            </aside>
          </div>

          <div
            className="mt-6 p-5 border rounded"
            style={{ borderColor: brown }}
          >
            <h3 className="font-semibold mb-3" style={{ color: brown }}>
              My Sessions
            </h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2" style={{ color: brown }}>
                    Date
                  </th>
                  <th className="py-2" style={{ color: brown }}>
                    Time
                  </th>
                  <th className="py-2" style={{ color: brown }}>
                    Subject
                  </th>
                  <th className="py-2" style={{ color: brown }}>
                    Group
                  </th>
                  <th className="py-2" style={{ color: brown }}>
                    Room
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-2">2025-11-03</td>
                  <td className="py-2">08:00 - 09:30</td>
                  <td className="py-2">Mathematics</td>
                  <td className="py-2">A</td>
                  <td className="py-2">101</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2">2025-11-03</td>
                  <td className="py-2">09:45 - 11:15</td>
                  <td className="py-2">Physics</td>
                  <td className="py-2">B</td>
                  <td className="py-2">202</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
