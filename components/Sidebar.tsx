"use client";
import Link from "next/link";
import React from "react";

interface SidebarProps {
  title: string;
}

export default function Sidebar({ title }: SidebarProps) {
  return (
    <aside className="w-1/4 min-h-screen bg-slate-50 border-r border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <nav className="flex flex-col gap-2">
        <Link href="/" className="px-3 py-2 rounded hover:bg-slate-100">
          Home
        </Link>
        <Link href="/teacher" className="px-3 py-2 rounded hover:bg-slate-100">
          My Dashboard
        </Link>
        <Link
          href="/teacher/profile"
          className="px-3 py-2 rounded hover:bg-slate-100"
        >
          My Profile
        </Link>
        <Link
          href="/teacher/timetable"
          className="px-3 py-2 rounded hover:bg-slate-100"
        >
          My Timetable
        </Link>
        <Link
          href="/teacher/sessions"
          className="px-3 py-2 rounded hover:bg-slate-100"
        >
          My Sessions
        </Link>
        <Link
          href="/teacher/availability"
          className="px-3 py-2 rounded hover:bg-slate-100"
        >
          Availability
        </Link>
        <Link
          href="/teacher/substitutes"
          className="px-3 py-2 rounded hover:bg-slate-100"
        >
          Substitute Requests
        </Link>
        <Link href="/settings" className="px-3 py-2 rounded hover:bg-slate-100">
          Settings
        </Link>
      </nav>
    </aside>
  );
}
