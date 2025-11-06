"use client";

import { useEffect, useState } from "react";
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
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    { key: "subject" as keyof SessionRow, label: "Subject" },
    { key: "teacher" as keyof SessionRow, label: "Teacher" },
    { key: "room" as keyof SessionRow, label: "Room" },
    { key: "day" as keyof SessionRow, label: "Day" },
    { key: "start" as keyof SessionRow, label: "Start" },
    { key: "end" as keyof SessionRow, label: "End" },
    { key: "actions" as any, label: "Actions" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/sessions?schoolId=1`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load sessions");
        const mapped: SessionRow[] = (data.sessions || []).map((s: any) => ({
          id: s.id,
          subject: s.subject?.name ?? String(s.subjectId),
          teacher: s.teacher
            ? `${s.teacher.firstName ?? ""} ${s.teacher.lastName ?? ""}`.trim()
            : "",
          room: "",
          day: "",
          start: "",
          end: "",
        }));
        setRows(mapped);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout
      title="Sessions"
      description="Manage and view scheduled sessions"
    >
      <Card title="All Sessions">
        {error ? (
          <p style={{ color: "#dc2626" }}>{error}</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable<SessionRow>
            columns={columns}
            data={rows}
            emptyMessage="No sessions yet."
          />
        )}
      </Card>
    </AdminLayout>
  );
}
