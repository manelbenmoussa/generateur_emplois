import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as teacherDao from "@/dao/teacherDao";
import { redirect } from "next/navigation";

export default async function AdminTeachersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const schoolId = session.user?.schoolId as number | undefined;

  if (!schoolId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Teachers</h2>
        <p className="mt-4 text-red-500">
          No school associated with your account.
        </p>
      </div>
    );
  }

  const teachers = await teacherDao.getTeachersBySchool(Number(schoolId));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Teachers</h2>

      <div className="overflow-x-auto bg-white/5 rounded-md border border-white/10">
        <table className="min-w-full text-left divide-y divide-white/10">
          <thead className="bg-white/2">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Max Weekly Hours</th>
              <th className="px-4 py-3">Specialized Subjects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-white/2">
                <td className="px-4 py-3">{t.user?.name ?? "(no name)"}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
