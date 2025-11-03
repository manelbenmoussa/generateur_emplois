"use client";

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
  const columns = [
    { key: "code" as keyof SubjectRow, label: "Code" },
    { key: "name" as keyof SubjectRow, label: "Name" },
    { key: "department" as keyof SubjectRow, label: "Department" },
    { key: "credits" as keyof SubjectRow, label: "Credits" },
    { key: "actions" as any, label: "Actions" },
  ];

  return (
    <AdminLayout
      title="Subjects"
      description="Manage subjects and related meta"
    >
      <Card title="All Subjects">
        <DataTable<SubjectRow>
          columns={columns}
          data={[]}
          emptyMessage="No subjects yet."
        />
      </Card>
    </AdminLayout>
  );
}
