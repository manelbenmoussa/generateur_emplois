"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl"></span>
              <h1 className="text-xl font-bold text-white">
                Timetable Generator
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {status === "loading" ? (
                <div className="text-white">Loading...</div>
              ) : session ? (
                <>
                  <div className="flex items-center gap-3">
                    {session.user?.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name || "Profile"}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                      />
                    )}
                    <div className="text-white text-sm">
                      <div className="font-medium">{session.user?.name}</div>
                      <div className="text-xs text-gray-300">
                        {session.user?.role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-white mb-6">
            AI-Powered Timetable Generator
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Automatically generate optimized schedules for schools and
            universities.
          </p>
          {session ? (
            <Link
              href="/generator"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Go to Generator
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started - Sign In
            </Link>
          )}
        </div>
      </div>
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-300">
          <p> 2025 Timetable Generator. Powered by AI </p>
        </div>
      </footer>
    </div>
  );
}
