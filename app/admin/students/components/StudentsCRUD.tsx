"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Student {
  id: number;
  userId: string;
  schoolId: number;
  groupId: number | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  group?: {
    id: number;
    level: string | null;
  } | null;
}

interface Group {
  id: number;
  level: string | null;
  specializationId: number;
}

export default function StudentsCRUD() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    groupId: "",
  });

  const schoolId = session?.user?.schoolId;

  const fetchStudents = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/students?schoolId=${schoolId}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data.students || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    if (!schoolId) return;

    try {
      const response = await fetch(`/api/groups?schoolId=${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchStudents();
      fetchGroups();
    } else {
      setLoading(false);
      setError(
        "No school associated with your account. Please contact support."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!schoolId) {
      setError("No school associated with your account");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        name: formData.name,
        schoolId,
        groupId: formData.groupId ? parseInt(formData.groupId) : null,
        ...(editingStudent && { id: editingStudent.id }),
      };

      // If we are editing an existing student, PATCH the student resource
      // only send the fields we support updating on the server (groupId).
      let response: Response;
      if (editingStudent) {
        response = await fetch(`/api/students/${editingStudent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: payload.groupId,
          }),
        });
      } else {
        response = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = response.ok ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data.error || "Failed to save student");
      }

      await fetchStudents();
      handleCloseModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save student";
      // show inside modal so it's visible above the backdrop
      setModalError(message);
      // also set global error for non-modal contexts
      setError(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete student");
      }

      await fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      email: student.user.email,
      name: student.user.name || "",
      groupId: student.groupId?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({ email: "", name: "", groupId: "" });
    setError("");
    setModalError("");
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Group"],
      ...students.map((s) => [
        s.user.name || "",
        s.user.email,
        s.group?.level || "No Group",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleBulkAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const groupId = formData.get("groupId") as string;

    for (const studentId of selectedStudents) {
      await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: groupId || null }),
      });
    }

    setIsBulkModalOpen(false);
    setSelectedStudents([]);
    await fetchStudents();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedStudents.length} students?`)) return;

    for (const id of selectedStudents) {
      await fetch(`/api/students/${id}`, { method: "DELETE" });
    }

    setSelectedStudents([]);
    await fetchStudents();
  };

  const toggleSelectStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  // Filter and search
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup =
      filterGroup === "all" ||
      (filterGroup === "none" && !student.groupId) ||
      student.groupId?.toString() === filterGroup;

    return matchesSearch && matchesGroup;
  });

  // Group students by group
  const groupedStudents = Array.isArray(filteredStudents)
    ? filteredStudents.reduce((acc, student) => {
        const groupName = student.group?.level || "No Group";
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(student);
        return acc;
      }, {} as Record<string, Student[]>)
    : {};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading students...</div>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400 text-lg">
          No school associated with your account. Please contact support.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Students</h2>
          <p className="text-gray-400 text-sm mt-1">
            Total: {students.length} students{" "}
            {selectedStudents.length > 0 &&
              `• ${selectedStudents.length} selected`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            📥 Export
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all" className="bg-gray-900">
            All Groups
          </option>
          <option value="none" className="bg-gray-900">
            No Group
          </option>
          {groups.map((group) => (
            <option key={group.id} value={group.id} className="bg-gray-900">
              {group.level}
            </option>
          ))}
        </select>
        {selectedStudents.length > 0 && (
          <>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Assign Group
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Delete ({selectedStudents.length})
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Students List - Grouped by Group */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center text-gray-400">
            {students.length === 0
              ? 'No students found. Click "Add Student" to create one.'
              : "No students match your search criteria."}
          </div>
        ) : (
          Object.entries(groupedStudents).map(([groupName, groupStudents]) => (
            <div
              key={groupName}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
            >
              <div className="bg-black/30 px-6 py-3 border-b border-white/10 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={groupStudents.every((s) =>
                    selectedStudents.includes(s.id)
                  )}
                  onChange={() => {
                    const allSelected = groupStudents.every((s) =>
                      selectedStudents.includes(s.id)
                    );
                    if (allSelected) {
                      setSelectedStudents((prev) =>
                        prev.filter(
                          (id) => !groupStudents.find((s) => s.id === id)
                        )
                      );
                    } else {
                      const newIds = groupStudents.map((s) => s.id);
                      setSelectedStudents((prev) =>
                        Array.from(new Set([...prev, ...newIds]))
                      );
                    }
                  }}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <h3 className="text-lg font-bold text-white">
                  {groupName} ({groupStudents.length})
                </h3>
              </div>
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedStudents.length === filteredStudents.length &&
                          filteredStudents.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {groupStudents.map((student) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-white/5 transition ${
                        selectedStudents.includes(student.id)
                          ? "bg-blue-500/10"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleSelectStudent(student.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {student.user.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {student.user.email}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingStudent ? "Edit Student" : "Add New Student"}
            </h3>

            {/* Show modal errors here so they appear above the overlay */}
            {modalError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 z-60 relative">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingStudent}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group (Optional)
                </label>
                <select
                  value={formData.groupId}
                  onChange={(e) =>
                    setFormData({ ...formData, groupId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-gray-900">
                    No Group
                  </option>
                  {groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                      className="bg-gray-900"
                    >
                      {group.level || `Group ${group.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
                >
                  {editingStudent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Assign Group to {selectedStudents.length} Students
            </h3>
            <form onSubmit={handleBulkAssign} className="space-y-4">
              <select
                name="groupId"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-gray-900">
                  No Group
                </option>
                {groups.map((group) => (
                  <option
                    key={group.id}
                    value={group.id}
                    className="bg-gray-900"
                  >
                    {group.level}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
