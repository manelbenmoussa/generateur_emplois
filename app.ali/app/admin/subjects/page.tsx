"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";
import DataTable from "@/components/DataTable";

interface SubjectRow {
  id: number;
  code: string;
  name: string;
  department: string;
  credits: number;
}

export default function AdminSubjectsPage() {
  const [rows, setRows] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    { key: "code" as keyof SubjectRow, label: "Code" },
    { key: "name" as keyof SubjectRow, label: "Name" },
    { key: "department" as keyof SubjectRow, label: "Department" },
    { key: "credits" as keyof SubjectRow, label: "Credits" },
    { key: "actions" as any, label: "Actions" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/subjects?schoolId=1`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load subjects");
        // Map server Subject to SubjectRow placeholder fields
        const mapped: SubjectRow[] = (data.subjects || []).map((s: any) => ({
          id: s.id,
          code: String(s.id),
          name: s.name,
          department: s.department?.name ?? String(s.departmentId),
          credits: Number(s.hourVolume ?? 0),
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
      title="Subjects"
      description="Manage subjects and related meta"
    >
      <Card title="All Subjects">
        {error ? (
          <p style={{ color: "#dc2626" }}>{error}</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable<SubjectRow>
            columns={columns}
            data={rows}
            emptyMessage="No subjects yet."
          />
        )}
      </Card>
    </AdminLayout>
  );
}
