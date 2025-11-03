"use client";

import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";
import DataTable from "@/components/DataTable";

interface SessionRow {
  id: number;
  subject: string;
  teacher: string;
  room: string;
  day: string;
  start: string;
  end: string;
}

export default function AdminSessionsPage() {
  const columns = [
    { key: "subject" as keyof SessionRow, label: "Subject" },
    { key: "teacher" as keyof SessionRow, label: "Teacher" },
    { key: "room" as keyof SessionRow, label: "Room" },
    { key: "day" as keyof SessionRow, label: "Day" },
    { key: "start" as keyof SessionRow, label: "Start" },
    { key: "end" as keyof SessionRow, label: "End" },
    { key: "actions" as any, label: "Actions" },
  ];

  return (
    <AdminLayout
      title="Sessions"
      description="Manage and view scheduled sessions"
    >
      <Card title="All Sessions">
        <DataTable<SessionRow>
          columns={columns}
          data={[]}
          emptyMessage="No sessions yet."
        />
      </Card>
    </AdminLayout>
  );
}
