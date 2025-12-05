"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Department {
  id: number;
  name: string;
}

export default function DepartmentsCRUD() {
  const { data: session } = useSession();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formName, setFormName] = useState("");

  const schoolId = session?.user?.schoolId;

  const fetchDepartments = async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/departments?schoolId=${schoolId}`);
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchDepartments();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setIsModalOpen(true);
  };

  const openEdit = (d: Department) => {
    setEditing(d);
    setFormName(d.name);
    setIsModalOpen(true);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formName) return alert("Name required");

    try {
      const payload: { name: string; schoolId: number } = {
        name: formName,
        schoolId,
      };
      let res: Response;
      if (editing) {
        res = await fetch(`/api/departments`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        res = await fetch(`/api/departments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save department");
      }

      await fetchDepartments();
      setIsModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Delete this department? Rooms assigned to it will be unassigned."
      )
    )
      return;
    try {
      const res = await fetch(`/api/departments?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete department");
      }
      await fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading departments...</div>
      </div>
    );
  if (!schoolId)
    return (
      <div className="text-red-400">
        No school associated with your account.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Departments</h2>
        <div className="flex gap-3">
          <button
            onClick={openCreate}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg"
          >
            + Add Department
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.length === 0 ? (
            <p className="text-gray-400 col-span-full">No departments yet.</p>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <span className="text-white font-medium">{dept.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(dept)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editing ? "Edit Department" : "Add Department"}
            </h3>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
