"use client";
import SessionsCRUD from "../components/SessionsCRUD";

export default function AdminSessionsPage() {
  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Manage Sessions</h1>
      <SessionsCRUD />
    </div>
  );
}
