import React from "react";
import TwoColumnLayout from "@/components/TwoColumnLayout";

export default function TeacherTimetablePage() {
  return (
    <TwoColumnLayout title="Teacher - Timetable">
      <h1 className="text-2xl font-bold mb-4">My Timetable</h1>
      <p className="text-slate-600">Your weekly timetable will appear here.</p>
    </TwoColumnLayout>
  );
}
