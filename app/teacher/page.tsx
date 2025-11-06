"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user?.role !== "TEACHER") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading" || session?.user?.role !== "TEACHER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {/* Left sidebar 25% */}
      <aside className="w-1/4 min-h-screen bg-black/30 backdrop-blur-lg border-r border-white/10">
        <div className="p-6 text-white">
          <h1 className="text-lg font-bold mb-6">Teacher Portal</h1>

          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-white/90 hover:text-white transition hover:underline"
            >
              Home
            </Link>
            <Link
              href="/teacher/profile"
              className="text-white/90 hover:text-white transition hover:underline"
            >
              Profile
            </Link>
            <Link
              href="/teacher/timetable"
              className="text-white/90 hover:text-white transition hover:underline"
            >
              My Timetable
            </Link>
            <Link
              href="/teacher/sessions"
              className="text-white/90 hover:text-white transition hover:underline"
            >
              My Sessions
            </Link>
            <Link
              href="/teacher/availability"
              className="text-white/90 hover:text-white transition hover:underline"
            >
              Availability
            </Link>
            <Link
              href="/teacher/substitutes"
              className="text-white/90 hover:text-white transition hover:underline"
            >
              Substitutes
            </Link>
          </nav>
        </div>
      </aside>

      {/* Right content 75% */}
      <main className="w-3/4 p-8">
        <section className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              Welcome, {session.user?.name}
            </h2>
            <p className="text-sm text-gray-200">
              Below is your teaching dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
              <h3 className="font-semibold mb-3 text-white">My Timetable</h3>
              <div className="border border-white/20 rounded p-4 text-sm text-white bg-white/5">
                <p>
                  Today:{" "}
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <ul className="mt-2 space-y-2">
                  <li className="p-2 border border-white/20 rounded flex justify-between items-center bg-white/5">
                    <div>
                      <div className="font-medium">08:00 - 09:30</div>
                      <div className="text-sm text-gray-200">
                        Mathematics — Room 101 — Group A
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-green-300">
                      In class
                    </div>
                  </li>
                  <li className="p-2 border border-white/20 rounded flex justify-between items-center bg-white/5">
                    <div>
                      <div className="font-medium">09:45 - 11:15</div>
                      <div className="text-sm text-gray-200">
                        Physics — Room 202 — Group B
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-blue-300">
                      Upcoming
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <aside className="p-5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
              <h3 className="font-semibold mb-3 text-white">
                Hours & Availability
              </h3>
              <div className="mb-3">
                <div className="text-sm text-gray-200">
                  Assigned hours this week
                </div>
                <div className="text-xl font-bold text-white">10.5 / 16 h</div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-white">Availability</h4>
                <div className="text-sm text-gray-200">
                  You are available for today
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-6 p-5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
            <h3 className="font-semibold mb-3 text-white">My Sessions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-2">Date</th>
                    <th className="py-2">Time</th>
                    <th className="py-2">Subject</th>
                    <th className="py-2">Group</th>
                    <th className="py-2">Room</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/20">
                    <td className="py-2">{new Date().toLocaleDateString()}</td>
                    <td className="py-2">08:00 - 09:30</td>
                    <td className="py-2">Mathematics</td>
                    <td className="py-2">A</td>
                    <td className="py-2">101</td>
                  </tr>
                  <tr className="border-t border-white/20">
                    <td className="py-2">{new Date().toLocaleDateString()}</td>
                    <td className="py-2">09:45 - 11:15</td>
                    <td className="py-2">Physics</td>
                    <td className="py-2">B</td>
                    <td className="py-2">202</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
