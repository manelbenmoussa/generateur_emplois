import Link from "next/link";
import GenerateTimetable from "@/components/GenerateTimetable";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose a dashboard to continue (no authentication wired yet)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link
            href="/admin"
            className="p-6 rounded-xl bg-white shadow hover:shadow-md transition border border-slate-200"
          >
            <div className="text-xl font-semibold mb-2">Admin Dashboard</div>
            <p className="text-slate-600">
              Manage rooms, sessions, subjects, teachers and students.
            </p>
          </Link>
          <Link
            href="/teacher"
            className="p-6 rounded-xl bg-white shadow hover:shadow-md transition border border-slate-200"
          >
            <div className="text-xl font-semibold mb-2">Teacher Dashboard</div>
            <p className="text-slate-600">
              View your timetable and teaching assignments.
            </p>
          </Link>
          <Link
            href="/student"
            className="p-6 rounded-xl bg-white shadow hover:shadow-md transition border border-slate-200"
          >
            <div className="text-xl font-semibold mb-2">Student Dashboard</div>
            <p className="text-slate-600">See your classes and schedule.</p>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Timetable Generator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This tool generates the timetable and opens a printable version.
          </p>
        </div>

        <GenerateTimetable />

        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
          <p>Powered by AI-driven scheduling algorithms 🚀</p>
        </div>
      </div>
    </div>
  );
}
