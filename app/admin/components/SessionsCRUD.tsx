"use client";
import React, { useState, useEffect } from "react";
import Card from "./Card";
import SessionFilters from "./sessions/SessionFilters";
import SessionTable from "./sessions/SessionTableClean";

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
  // UI filters & sorting
  const [filterScheduled, setFilterScheduled] = useState<
    "all" | "scheduled" | "unscheduled"
  >("all");
  const [weekdayFilter, setWeekdayFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "group" | "subject" | "teacher" | "weekday" | "time"
  >("group");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // components are imported at top-level

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
        // raw sessions loaded (debug log removed)
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

  // filtered/sorted lists are computed below; we don't need raw scheduled/unscheduled vars

  // Apply UI filters and sorting to sessions
  function matchesFilters(s: RawSession) {
    if (selectedSubject && s.subjectId !== selectedSubject) return false;
    if (selectedGroup && s.groupId !== selectedGroup) return false;
    if (selectedTeacher && s.teacher?.id !== selectedTeacher) return false;
    if (weekdayFilter && s.scheduled_weekday !== weekdayFilter) return false;
    return true;
  }

  function compareSessions(a: RawSession, b: RawSession) {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortBy) {
      case "group":
        return (
          dir *
          (
            (a.group?.specialization?.name ?? "") +
            " " +
            (a.group?.level ?? "")
          ).localeCompare(
            (b.group?.specialization?.name ?? "") + " " + (b.group?.level ?? "")
          )
        );
      case "subject":
        return (
          dir * (a.subject?.name ?? "").localeCompare(b.subject?.name ?? "")
        );
      case "teacher":
        return (
          dir *
          (a.teacher?.user?.name ?? "").localeCompare(
            b.teacher?.user?.name ?? ""
          )
        );
      case "weekday":
        return (
          dir *
          (a.scheduled_weekday ?? "").localeCompare(b.scheduled_weekday ?? "")
        );
      case "time":
        return (
          dir * (a.scheduled_time ?? "").localeCompare(b.scheduled_time ?? "")
        );
      default:
        return 0;
    }
  }

  const filteredSessions = sessions.filter((s) => {
    if (filterScheduled === "scheduled")
      return s.scheduled_weekday && s.scheduled_time && matchesFilters(s);
    if (filterScheduled === "unscheduled")
      return (!s.scheduled_weekday || !s.scheduled_time) && matchesFilters(s);
    return matchesFilters(s);
  });

  const filteredScheduled = filteredSessions
    .filter((s) => s.scheduled_weekday && s.scheduled_time)
    .sort(compareSessions);
  const filteredUnscheduled = filteredSessions
    .filter((s) => !s.scheduled_weekday || !s.scheduled_time)
    .sort(compareSessions);

  function openEditModal(session: RawSession) {
    // Prefill autocomplete/search fields so the modal shows existing values
    setSelectedSubject(session.subjectId ?? null);
    setSubjectQuery(
      session.subject?.name ??
        (session.subjectId ? `#${session.subjectId}` : "")
    );
    setSelectedGroup(session.groupId ?? null);
    setGroupQuery(
      session.group
        ? `${session.group.specialization?.name ?? ""} ${
            session.group.level ?? ""
          }`.trim()
        : session.groupId
        ? `#${session.groupId}`
        : ""
    );
    setSelectedTeacher(session.teacher?.id ?? null);
    setTeacherQuery(
      session.teacher?.user?.name ??
        (session.teacher?.id ? `T${session.teacher.id}` : "")
    );
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
          <SessionFilters
            filterScheduled={filterScheduled}
            setFilterScheduled={setFilterScheduled}
            weekdayFilter={weekdayFilter}
            setWeekdayFilter={setWeekdayFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDir={sortDir}
            setSortDir={setSortDir}
            clearFilters={() => {
              setFilterScheduled("all");
              setWeekdayFilter("");
              setSelectedSubject(null);
              setSelectedGroup(null);
              setSelectedTeacher(null);
              setSubjectQuery("");
              setGroupQuery("");
              setTeacherQuery("");
            }}
          />

          {filterScheduled !== "unscheduled" && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Scheduled Sessions
              </h3>
              {filteredScheduled.length === 0 ? (
                <p className="text-gray-200">No scheduled sessions yet.</p>
              ) : (
                <SessionTable
                  sessions={filteredScheduled}
                  onEdit={openEditModal}
                  onDelete={openDelete}
                  renderGroupName={renderGroupName}
                  showSchedule
                />
              )}
            </div>
          )}

          {filterScheduled !== "scheduled" && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Unscheduled Sessions
              </h3>
              {filteredUnscheduled.length === 0 ? (
                <p className="text-gray-200">All sessions are scheduled.</p>
              ) : (
                <SessionTable
                  sessions={filteredUnscheduled}
                  onEdit={openEditModal}
                  onDelete={openDelete}
                  renderGroupName={renderGroupName}
                  showSchedule={false}
                />
              )}
            </div>
          )}
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
