"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";
import DataTable from "@/components/DataTable";

interface StudentRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  group: string;
}

export default function AdminStudentsPage() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    { key: "firstName" as keyof StudentRow, label: "First Name" },
    { key: "lastName" as keyof StudentRow, label: "Last Name" },
    { key: "email" as keyof StudentRow, label: "Email" },
    { key: "group" as keyof StudentRow, label: "Group" },
    { key: "actions" as any, label: "Actions" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/students?schoolId=1`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load students");
        const mapped: StudentRow[] = (data.students || []).map((s: any) => ({
          id: s.id,
          firstName: s.firstName ?? "",
          lastName: s.lastName ?? "",
          email: s.email ?? "",
          group: s.groupId ? String(s.groupId) : "",
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
    <AdminLayout title="Students" description="Manage students and enrollments">
      <Card title="All Students">
        {error ? (
          <p style={{ color: "#dc2626" }}>{error}</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable<StudentRow>
            columns={columns}
            data={rows}
            emptyMessage="No students yet."
          />
        )}
      </Card>
    </AdminLayout>
  );
}
