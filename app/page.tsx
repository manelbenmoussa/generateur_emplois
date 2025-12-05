"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleConfirmedParam = searchParams?.get("roleConfirmed");

    // If the user just confirmed a role and was redirected here with the
    // `roleConfirmed=1` query param, temporarily skip sending them back to
    // the confirm page. We'll remove the param immediately so future loads
    // behave normally.
    if (roleConfirmedParam) {
      try {
        router.replace("/");
      } catch {
        // ignore
      }
      return;
    }

    if (status === "authenticated") {
      const skip =
        typeof window !== "undefined" &&
        localStorage.getItem("roleConfirmedRecently");

      // Only redirect to the role confirmation page when the server has
      // completed its DB-based role check. This avoids a race where the
      // client shows the confirm page briefly while the server is still
      // determining whether confirmation is needed.
      const needsRole = !!session?.user?.needsRoleConfirmation;
      const roleCheckComplete = !!(session?.user as { [k: string]: unknown })[
        "roleCheckComplete"
      ];

      if (needsRole && roleCheckComplete && !skip) {
        try {
          router.replace("/auth/confirm-role");
        } catch {
          // ignore
        }
      }
    }
  }, [status, session, router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl"></span>
              <h1 className="text-xl font-bold text-white">
                Timetable Manager
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-white mb-6">
            Timetable Manager
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Automatically generate optimized schedules for schools and
            universities.
            
          </p>
          {session ? (
            <div className="flex gap-4 justify-center">
              {session.user?.role === "ADMIN" && (
                <>
                  <button
                    onClick={() => router.push("/admin")}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Go to Admin Dashboard
                  </button>
                </>
              )}
              {session.user?.role === "TEACHER" && (
                <Link
                  href="/teacher"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Go to Teacher Dashboard
                </Link>
              )}
              {session.user?.role === "STUDENT" && (
                <Link
                  href="/student"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Go to Student Dashboard
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started - Sign In
            </Link>
          )}
        </div>

        {/* Features section describing app functionality */}
        <section className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-2 md:grid-cols-3 items-stretch">
          <div className="bg-white/6 p-6 rounded-lg border border-white/8">
            <h3 className="text-lg font-semibold text-white mb-2">
              Auto Generation
            </h3>
            <p className="text-sm text-gray-200">
              Generate conflict-free timetables using constraints and AI
              optimizations so you save planning time.
            </p>
          </div>
          <div className="bg-white/6 p-6 rounded-lg border border-white/8">
            <h3 className="text-lg font-semibold text-white mb-2">
              Custom Constraints
            </h3>
            <p className="text-sm text-gray-200">
              Define constraints like room capacity, teacher availability, and
              subject specializations to get practical schedules.
            </p>
          </div>
          <div className="bg-white/6 p-6 rounded-lg border border-white/8">
            <h3 className="text-lg font-semibold text-white mb-2">
              Export & Share
            </h3>
            <p className="text-sm text-gray-200">
              Export generated timetables to PDF and share with staff and
              students seamlessly.
            </p>
          </div>
        </section>
      </main>
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-300">
          <p>© 2025 Timetable Generator.</p>
        </div>
      </footer>
    </div>
  );
}
