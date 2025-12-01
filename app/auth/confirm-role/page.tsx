"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ConfirmRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schools, setSchools] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [role, setRole] = useState<string>("STUDENT");
  const [schoolId, setSchoolId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.needsRoleConfirmation) {
      router.replace("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await fetch("/api/schools");
        if (res.ok) {
          const data = await res.json();
          setSchools(data || []);
          if (data?.[0]) setSchoolId(String(data[0].id));
        }
      } catch (e) {
        void e;
      }
    }
    loadSchools();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!role) return setError("Please choose a role");
    if (!schoolId) return setError("Please choose a school");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, schoolId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error || "Failed to confirm role");
      } else {
        setSuccess(true);
        try {
          // Mark recently confirmed to avoid redirect loop during immediate
          // navigation.
          localStorage.setItem("roleConfirmedRecently", "1");
          setTimeout(
            () => localStorage.removeItem("roleConfirmedRecently"),
            10_000
          );
        } catch {
          // ignore
        }

        // Try to fetch the authoritative session to warm any caches. Use a
        // cache-busting query param and include credentials so the server
        // rebuilds the session which reads the DB for the role.
        try {
          await fetch(`/api/auth/session?ts=${Date.now()}`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });
        } catch {
          // ignore
        }

        // Do a full navigation so the UI is rebuilt with the fresh session.
        // This is the most reliable way to ensure NextAuth's session callback
        // runs server-side and returns the updated role.
        try {
          window.location.href = "/";
          return;
        } catch {
          // fallback to router replace if direct assign fails
          router.replace("/");
        }
      }
    } catch (err) {
      void err;
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-black/30 backdrop-blur-md rounded-xl ring-1 ring-white/10 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user?.name || "Profile"}
              className="w-14 h-14 rounded-full object-cover border"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-600/30" />
          )}
          <div>
            <div className="font-medium text-lg text-white">
              {session?.user?.name}
            </div>
            <div className="text-sm text-gray-200/80">
              {session?.user?.email}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-2">Confirm your role</h2>
        <p className="text-sm text-gray-200/80 mb-4">
          Please choose your role and assign a school to finish setting up your
          account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "STUDENT", label: "Student" },
                { key: "TEACHER", label: "Teacher" },
                { key: "ADMIN", label: "Administrator" },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`py-2 px-3 border rounded-lg text-sm font-medium ${
                    role === r.key
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent"
                      : "bg-black/20 text-gray-100 hover:bg-black/10 border-white/10"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School
            </label>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="mt-1 block w-full rounded-md bg-black/20 border border-white/10 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a school</option>
              {schools.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && (
            <div className="text-green-400 text-sm">
              Role confirmed — redirecting...
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Confirm Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
