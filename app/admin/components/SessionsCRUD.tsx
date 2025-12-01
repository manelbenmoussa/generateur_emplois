"use client";
import React, { useState, useEffect } from "react";
import Card from "./Card";

type RawGroup = {
  id: number;
  specialization?: { name?: string | null } | null;
  level?: string | null;
};
type RawTeacher = {
  id: number;
  user?: { name?: string | null } | null;
};
export type RawSession = {
  id: number;
  subjectId?: number | null;
  subject?: { name?: string | null } | null;
  group?: RawGroup | null;
  groupId?: number | null;
  teacher?: RawTeacher | null;
  scheduled_weekday?: string | null;
  scheduled_time?: string | null;
};

export default function SessionsCRUD() {
  const [sessions, setSessions] = useState<RawSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | {
    type: "add" | "edit";
    session?: RawSession;
  }>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // For search/autocomplete
  const [subjectQuery, setSubjectQuery] = useState("");
  const [subjectResults, setSubjectResults] = useState<
    { id: number; name: string }[]
  >([]);
  const [groupQuery, setGroupQuery] = useState("");
  const [groupResults, setGroupResults] = useState<
    { id: number; name: string }[]
  >([]);
  const [teacherQuery, setTeacherQuery] = useState("");
  const [teacherResults, setTeacherResults] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/sessions")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch sessions");
        }
        return res.json();
      })
      .then((data) => {
        // Log raw sessions for debugging missing data
        // eslint-disable-next-line no-console
        console.debug("/api/sessions ->", data.sessions);
        setSessions(data.sessions || []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Autocomplete handlers
  useEffect(() => {
    if (subjectQuery.length < 1) return setSubjectResults([]);
    const timeout = setTimeout(() => {
      fetch(`/api/subjects?q=${encodeURIComponent(subjectQuery)}`)
        .then((res) => res.json())
        .then((data) => setSubjectResults(data.subjects || []));
    }, 200);
    return () => clearTimeout(timeout);
  }, [subjectQuery]);
  useEffect(() => {
    if (groupQuery.length < 1) return setGroupResults([]);
    const timeout = setTimeout(() => {
      fetch(`/api/groups?q=${encodeURIComponent(groupQuery)}`)
        .then((res) => res.json())
        .then((data) => setGroupResults(data.groups || []));
    }, 200);
    return () => clearTimeout(timeout);
  }, [groupQuery]);
  useEffect(() => {
    if (teacherQuery.length < 1) return setTeacherResults([]);
    const timeout = setTimeout(() => {
      fetch(`/api/teachers?q=${encodeURIComponent(teacherQuery)}`)
        .then((res) => res.json())
        .then((data) => setTeacherResults(data.teachers || []));
    }, 200);
    return () => clearTimeout(timeout);
  }, [teacherQuery]);

  const scheduled = sessions.filter(
    (s) => s.scheduled_weekday && s.scheduled_time
  );
  const unscheduled = sessions.filter(
    (s) => !s.scheduled_weekday || !s.scheduled_time
  );

  function openEditModal(session: RawSession) {
    // Prefill autocomplete/search fields so the modal shows existing values
    setSelectedSubject(session.subjectId ?? null);
    setSubjectQuery(session.subject?.name ?? (session.subjectId ? `#${session.subjectId}` : ""));
    setSelectedGroup(session.groupId ?? null);
    setGroupQuery(
      session.group
        ? `${session.group.specialization?.name ?? ""} ${session.group.level ?? ""}`.trim()
        : session.groupId
        ? `#${session.groupId}`
        : ""
    );
    setSelectedTeacher(session.teacher?.id ?? null);
    setTeacherQuery(session.teacher?.user?.name ?? (session.teacher?.id ? `T${session.teacher.id}` : ""));
    setModal({ type: "edit", session });
  }
  function openAddModal() {
    // Clear any previous selections when adding a new session
    setSelectedSubject(null);
    setSubjectQuery("");
    setSelectedGroup(null);
    setGroupQuery("");
    setSelectedTeacher(null);
    setTeacherQuery("");
    setModal({ type: "add" });
  }
  function openDelete(id: number) {
    setDeleteId(id);
  }
  function closeModal() {
    setModal(null);
    setActionError(null);
  }
  function closeDelete() {
    setDeleteId(null);
    setActionError(null);
  }

  type SessionPayload = {
    subjectId: number;
    groupId: number;
    teacherId: number;
    scheduled_weekday: string | null;
    scheduled_time: string | null;
  };

  async function handleModalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: SessionPayload = {
      subjectId: Number(formData.get("subjectId")),
      groupId: Number(formData.get("groupId")),
      teacherId: Number(formData.get("teacherId")),
      scheduled_weekday: (formData.get("scheduled_weekday") as string) || null,
      scheduled_time: (formData.get("scheduled_time") as string) || null,
    };
    const method = modal?.type === "edit" ? "PUT" : "POST";
    let url = "/api/sessions";
    if (modal?.type === "edit" && modal.session) {
      url += `?id=${modal.session.id}`;
    }
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      closeModal();
      // Refresh sessions
      setLoading(true);
      const refreshed = await fetch("/api/sessions");
      const data = await refreshed.json();
      setSessions(data.sessions || []);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Failed to save";
      setActionError(errMsg);
    } finally {
      setActionLoading(false);
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/sessions?id=${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      closeDelete();
      // Refresh sessions
      setLoading(true);
      const refreshed = await fetch("/api/sessions");
      const data = await refreshed.json();
      setSessions(data.sessions || []);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Failed to delete";
      setActionError(errMsg);
    } finally {
      setActionLoading(false);
      setLoading(false);
    }
  }

  function renderGroupName(s: RawSession) {
    const grp = s.group;
    if (!grp) return "-";
    const spec = grp.specialization?.name || "";
    return `${spec} ${grp.level ?? ""}`.trim();
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Sessions</h2>
        <button
          className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 shadow"
          onClick={openAddModal}
        >
          Add Session
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <>
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-white mb-4">
              Scheduled Sessions
            </h3>
            {scheduled.length === 0 ? (
              <p className="text-gray-200">No scheduled sessions yet.</p>
            ) : (
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Weekday
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {scheduled.map((s: RawSession) => (
                      <tr key={s.id} className="hover:bg-white/10 transition">
                        <td className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">
                          {renderGroupName(s)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {s.subject?.name ?? `#${s.subjectId}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {s.teacher?.user?.name ?? `T${s.teacher?.id ?? ""}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {s.scheduled_weekday}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {s.scheduled_time}
                        </td>
                        <td className="px-4 py-3 text-sm flex gap-2">
                          <button
                            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            onClick={() => openEditModal(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => openDelete(s.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Unscheduled Sessions
            </h3>
            {unscheduled.length === 0 ? (
              <p className="text-gray-200">All sessions are scheduled.</p>
            ) : (
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
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {unscheduled.map((s: RawSession) => (
                      <tr key={s.id} className="hover:bg-white/10 transition">
                        <td className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">
                          {renderGroupName(s)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {s.subject?.name ?? `#${s.subjectId}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {s.teacher?.user?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm flex gap-2">
                          <button
                            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            onClick={() => openEditModal(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => openDelete(s.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 bg-opacity-90 backdrop-blur-sm">
          <div className="flex items-center justify-center w-full min-h-screen">
            <Card className="border border-white/20 shadow-2xl rounded-2xl p-0 bg-white/95">
              <form className="p-10" onSubmit={handleModalSubmit}>
                <h3 className="text-2xl font-bold mb-8 text-blue-900">
                  {modal.type === "add" ? "Add Session" : "Edit Session"}
                </h3>
                {/* Subject search */}
                <div className="mb-5 relative">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Subject
                  </label>
                  <input
                    name="subjectId"
                    type="text"
                    autoComplete="off"
                    value={
                      selectedSubject
                        ? subjectResults.find((s) => s.id === selectedSubject)
                            ?.name || subjectQuery
                        : subjectQuery
                    }
                    onChange={(e) => {
                      setSubjectQuery(e.target.value);
                      setSelectedSubject(null);
                    }}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                    required
                  />
                  {subjectQuery &&
                    !selectedSubject &&
                    subjectResults.length > 0 && (
                      <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                        {subjectResults.map((subj) => (
                          <li
                            key={subj.id}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-900"
                            onClick={() => {
                              setSelectedSubject(subj.id);
                              setSubjectQuery(subj.name);
                            }}
                          >
                            {subj.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  {/* Hidden input for form submit */}
                  <input
                    type="hidden"
                    name="subjectId"
                    value={selectedSubject ?? ""}
                  />
                </div>
                {/* Group search */}
                <div className="mb-5 relative">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Group
                  </label>
                  <input
                    name="groupId"
                    type="text"
                    autoComplete="off"
                    value={
                      selectedGroup
                        ? groupResults.find((g) => g.id === selectedGroup)
                            ?.name || groupQuery
                        : groupQuery
                    }
                    onChange={(e) => {
                      setGroupQuery(e.target.value);
                      setSelectedGroup(null);
                    }}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                    required
                  />
                  {groupQuery && !selectedGroup && groupResults.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                      {groupResults.map((grp) => (
                        <li
                          key={grp.id}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-900"
                          onClick={() => {
                            setSelectedGroup(grp.id);
                            setGroupQuery(grp.name);
                          }}
                        >
                          {grp.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <input
                    type="hidden"
                    name="groupId"
                    value={selectedGroup ?? ""}
                  />
                </div>
                {/* Teacher search */}
                <div className="mb-5 relative">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Teacher
                  </label>
                  <input
                    name="teacherId"
                    type="text"
                    autoComplete="off"
                    value={
                      selectedTeacher
                        ? teacherResults.find((t) => t.id === selectedTeacher)
                            ?.name || teacherQuery
                        : teacherQuery
                    }
                    onChange={(e) => {
                      setTeacherQuery(e.target.value);
                      setSelectedTeacher(null);
                    }}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                    required
                  />
                  {teacherQuery &&
                    !selectedTeacher &&
                    teacherResults.length > 0 && (
                      <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                        {teacherResults.map((t) => (
                          <li
                            key={t.id}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-900"
                            onClick={() => {
                              setSelectedTeacher(t.id);
                              setTeacherQuery(t.name);
                            }}
                          >
                            {t.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  <input
                    type="hidden"
                    name="teacherId"
                    value={selectedTeacher ?? ""}
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Weekday
                  </label>
                  <input
                    name="scheduled_weekday"
                    type="text"
                    defaultValue={modal.session?.scheduled_weekday ?? ""}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Time
                  </label>
                  <input
                    name="scheduled_time"
                    type="text"
                    defaultValue={modal.session?.scheduled_time ?? ""}
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                  />
                </div>
                {actionError && (
                  <div className="text-red-600 mb-5 text-sm font-medium">
                    {actionError}
                  </div>
                )}
                <div className="flex gap-4 mt-8 justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-60 shadow"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-100 text-blue-900 rounded-lg font-semibold hover:bg-gray-200 border border-blue-200 shadow"
                    onClick={closeModal}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 bg-opacity-90 backdrop-blur-sm">
          <div className="flex items-center justify-center w-full min-h-screen">
            <Card className="border border-white/20 shadow-2xl rounded-2xl p-0 bg-white/95">
              <div className="p-10">
                <h3 className="text-2xl font-bold mb-8 text-blue-900">
                  Delete Session?
                </h3>
                {actionError && (
                  <div className="text-red-600 mb-5 text-sm font-medium">
                    {actionError}
                  </div>
                )}
                <div className="flex gap-4 mt-8 justify-end">
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 shadow"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={closeDelete}
                    className="px-6 py-2 bg-gray-100 text-blue-900 rounded-lg font-semibold hover:bg-gray-200 border border-blue-200 shadow"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
