import React from "react";
import TwoColumnLayout from "@/components/TwoColumnLayout";

export default function TeacherPage() {
  return (
    <TwoColumnLayout title="Teacher Dashboard">
      <section>
        <h1 className="text-2xl font-bold mb-4">Welcome, Teacher</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">My Timetable</h2>
            <p className="text-sm text-slate-600">
              Your weekly timetable will appear here.
            </p>
          </div>

          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Hours Utilization</h2>
            <p className="text-sm text-slate-600">Assigned hours: 10.5 / 16</p>
          </div>
        </div>
      </section>
    </TwoColumnLayout>
  );
}
