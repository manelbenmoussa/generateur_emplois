"use client";

import { useState, useEffect } from "react";
import { Subject } from "@/types/entities";
import { useSession } from "next-auth/react";

export default function SubjectsCRUD() {
  const { data: session } = useSession();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    hourVolume: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    hourVolume?: string;
  }>({});

  const schoolId = session?.user?.schoolId;

  const fetchSubjects = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/subjects?schoolId=${schoolId}`);
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchSubjects();
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
    setFieldErrors({});

    if (!schoolId) {
      setError("No school associated with your account");
      return;
    }

    // Client-side validation
    const newFieldErrors: { name?: string; hourVolume?: string } = {};
    const trimmedName = formData.name.trim();
    if (!trimmedName) newFieldErrors.name = "Name is required.";
    if (!formData.hourVolume.trim())
      newFieldErrors.hourVolume = "Hour volume is required.";
    else if (
      isNaN(Number(formData.hourVolume)) ||
      Number(formData.hourVolume) <= 0
    )
      newFieldErrors.hourVolume = "Enter a valid number > 0.";
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      const normalizeForSubmit = (s: string) =>
        s.replace(/\s+/g, " ").trim().normalize("NFKC");
      const payload = {
        // send trimmed + normalized name to avoid trailing-space and unicode duplicates
        name: normalizeForSubmit(trimmedName),
        hourVolume: parseFloat(formData.hourVolume),
        ...(editingSubject && { id: editingSubject.id }),
      };

      const response = await fetch("/api/subjects", {
        method: editingSubject ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Attempt to parse JSON body — server may return non-JSON on some error codes
      type DataBody = {
        fieldErrors?: { name?: string; hourVolume?: string };
        error?: string;
        // When duplicate is detected, server returns the matching subject for easier debugging
        existingSubject?: { id?: number; name?: string; hourVolume?: number };
      };
      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        // Ignore parse error and leave data null
      }

      if (!response.ok) {
        // Try to parse field errors from API if available (guard null)
        // Use type assertion for optional fieldErrors in unknown body
        const body = data as DataBody;
        if (body.fieldErrors) setFieldErrors(body.fieldErrors);
        // If the server returned a matching existing subject, include it in the modal error message for debugging
        if (body.existingSubject) {
          setModalError(
            `A subject already exists with the same name: "${body.existingSubject.name}" (id=${body.existingSubject.id}).`
          );
        }
        throw new Error(body.error || "Failed to save subject");
      }

      await fetchSubjects();
      handleCloseModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save subject";
      setModalError(message);
      setError(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
      const response = await fetch(`/api/subjects?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete subject");
      }

      await fetchSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      hourVolume: String(subject.hourVolume),
    });
    // Clear any previous errors
    setFieldErrors({});
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({ name: "", hourVolume: "" });
    setError("");
    setFieldErrors({});
    setModalError("");
  };

  // No grouping by department, just use subjects array

  // Calculate stats
  const totalSubjects = subjects.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading subjects...</div>
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
          <h2 className="text-2xl font-bold text-white">Subjects</h2>
          <p className="text-gray-400 text-sm mt-1">
            Total: {totalSubjects} subjects
          </p>
        </div>
        <button
          onClick={() => {
            setFieldErrors({});
            setModalError("");
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          + Add Subject
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Subjects List - Flat List */}
      <div className="space-y-4">
        {subjects.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center text-gray-400">
            No subjects found. Click &ldquo;Add Subject&rdquo; to create one.
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Hour Volume
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white font-medium">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {subject.hourVolume}h
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
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
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 z-60 relative">
                  {modalError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Introduction to Programming"
                />
                {fieldErrors.name && (
                  <div className="text-red-400 text-xs mt-1">
                    {fieldErrors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hour Volume
                </label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={formData.hourVolume}
                  onChange={(e) =>
                    setFormData({ ...formData, hourVolume: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3.0"
                />
                {fieldErrors.hourVolume && (
                  <div className="text-red-400 text-xs mt-1">
                    {fieldErrors.hourVolume}
                  </div>
                )}
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
                  {editingSubject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
