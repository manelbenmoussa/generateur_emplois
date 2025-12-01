"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Teacher {
  id: number;
  userId: string;
  schoolId: number;
  maxWeeklyHours?: number | null;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  subjects: Array<{
    subjectId: number;
    subject?: { id: number; name: string } | null;
  }>;
}

export default function TeachersCRUD() {
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schoolId = session?.user?.schoolId;

  const fetchTeachers = async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/teachers?schoolId=${schoolId}`);
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchTeachers();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading teachers...</div>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400 text-lg">
          No school associated with your account. Please contact support.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Teachers</h2>
          <p className="text-gray-400 text-sm mt-1">
            Total: {teachers.length} teachers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fetchTeachers()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white/5 rounded-md border border-white/10">
        <table className="min-w-full text-left divide-y divide-white/10">
          <thead className="bg-white/2">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Max Weekly Hours</th>
              <th className="px-4 py-3">Specialized Subjects</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-white/2">
                <td className="px-4 py-3 text-white font-medium">
                  {t.user?.name ?? "(no name)"}
                </td>
                <td className="px-4 py-3 text-sm text-white/90">
                  {t.user?.email}
                </td>
                <td className="px-4 py-3">{t.maxWeeklyHours ?? "—"}</td>
                <td className="px-4 py-3">
                  {t.subjects && t.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {t.subjects.map((ts) => (
                        <span
                          key={`${t.id}-${ts.subjectId}`}
                          className="text-xs px-2 py-1 bg-white/5 rounded"
                        >
                          {ts.subject?.name ?? `subject #${ts.subjectId}`}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-white/60">No subjects</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={async () => {
                      if (
                        !confirm("Delete this teacher? This cannot be undone.")
                      )
                        return;
                      try {
                        const res = await fetch(`/api/teachers/${t.id}`, {
                          method: "DELETE",
                        });
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          throw new Error(
                            data.error || "Failed to delete teacher"
                          );
                        }
                        // Refresh list
                        await fetchTeachers();
                      } catch (err) {
                        alert(err instanceof Error ? err.message : String(err));
                      }
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
