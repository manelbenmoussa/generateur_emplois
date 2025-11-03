"use client";

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
  const columns = [
    { key: "firstName" as keyof StudentRow, label: "First Name" },
    { key: "lastName" as keyof StudentRow, label: "Last Name" },
    { key: "email" as keyof StudentRow, label: "Email" },
    { key: "group" as keyof StudentRow, label: "Group" },
    { key: "actions" as any, label: "Actions" },
  ];

  return (
    <AdminLayout title="Students" description="Manage students and enrollments">
      <Card title="All Students">
        <DataTable<StudentRow>
          columns={columns}
          data={[]}
          emptyMessage="No students yet."
        />
      </Card>
    </AdminLayout>
  );
}
