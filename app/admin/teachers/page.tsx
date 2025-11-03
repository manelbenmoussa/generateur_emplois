"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";
import DataTable from "@/components/DataTable";

interface TeacherRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
}

export default function AdminTeachersPage() {
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    { key: "firstName" as keyof TeacherRow, label: "First Name" },
    { key: "lastName" as keyof TeacherRow, label: "Last Name" },
    { key: "email" as keyof TeacherRow, label: "Email" },
    { key: "specialization" as keyof TeacherRow, label: "Specializations" },
    { key: "actions" as any, label: "Actions" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/teachers?schoolId=1`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load teachers");
        const mapped: TeacherRow[] = (data.teachers || []).map((t: any) => ({
          id: t.id,
          firstName: t.firstName ?? "",
          lastName: t.lastName ?? "",
          email: t.email ?? "",
          specialization: Array.isArray(t.expertSubjects)
            ? `${t.expertSubjects.length} subjects`
            : "",
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
    <AdminLayout title="Teachers" description="Manage teachers and assignments">
      <Card title="All Teachers">
        {error ? (
          <p style={{ color: "#dc2626" }}>{error}</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable<TeacherRow>
            columns={columns}
            data={rows}
            emptyMessage="No teachers yet."
          />
        )}
      </Card>
    </AdminLayout>
  );
}
