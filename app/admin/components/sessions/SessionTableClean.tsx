"use client";

import React from "react";
import type { RawSession } from "../SessionsCRUD";

type Props = {
  sessions: RawSession[];
  onEdit: (s: RawSession) => void;
  onDelete: (id: number) => void;
  renderGroupName: (s: RawSession) => string;
  showSchedule?: boolean;
};

export default function SessionTable({
  sessions,
  onEdit,
  onDelete,
  renderGroupName,
  showSchedule = true,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-black/30">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Group
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Teacher
            </th>
            {showSchedule && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Weekday
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Time
                </th>
              </>
            )}
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white/5 divide-y divide-white/10">
          {sessions.map((s) => (
            <tr key={s.id} className="hover:bg-white/10 transition">
              <td className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">
                {renderGroupName(s)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-200">
                {s.subject?.name ?? `#${s.subjectId}`}
              </td>
              <td className="px-4 py-3 text-sm text-gray-200">
                {s.teacher?.user?.name ??
                  (showSchedule ? `T${s.teacher?.id ?? ""}` : "-")}
              </td>
              {showSchedule && (
                <>
                  <td className="px-4 py-3 text-sm text-gray-200">
                    {s.scheduled_weekday}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200">
                    {s.scheduled_time}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-sm flex gap-2">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => onEdit(s)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => onDelete(s.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
