import React from "react";
import TwoColumnLayout from "@/components/TwoColumnLayout";

export default function TeacherSessionsPage() {
  return (
    <TwoColumnLayout title="Teacher - Sessions">
      <h1 className="text-2xl font-bold mb-4">My Sessions</h1>
      <p className="text-slate-600">
        List of your assigned sessions will appear here.
      </p>
    </TwoColumnLayout>
  );
}
