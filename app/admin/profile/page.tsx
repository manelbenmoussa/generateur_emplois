"use client";

import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";

export default function AdminProfilePage() {
  return (
    <AdminLayout title="Profile" description="Your administrator profile">
      <Card title="Profile Overview">
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <strong>Name:</strong> <span>Admin User</span>
          </div>
          <div>
            <strong>Email:</strong> <span>admin@example.com</span>
          </div>
          <div>
            <strong>Role:</strong> <span>Administrator</span>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
