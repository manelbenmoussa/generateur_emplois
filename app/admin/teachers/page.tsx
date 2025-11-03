"use client";

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
  const columns = [
    { key: "firstName" as keyof TeacherRow, label: "First Name" },
    { key: "lastName" as keyof TeacherRow, label: "Last Name" },
    { key: "email" as keyof TeacherRow, label: "Email" },
    { key: "specialization" as keyof TeacherRow, label: "Specialization" },
    { key: "actions" as any, label: "Actions" },
  ];

  return (
    <AdminLayout title="Teachers" description="Manage teachers and assignments">
      <Card title="All Teachers">
        <DataTable<TeacherRow>
          columns={columns}
          data={[]}
          emptyMessage="No teachers yet."
        />
      </Card>
    </AdminLayout>
  );
}
