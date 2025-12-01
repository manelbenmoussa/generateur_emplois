"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Department {
  id: number;
  name: string;
}

interface Specialization {
  id: number;
  name: string;
  departmentId: number;
  department?: { id: number; name: string } | null;
}

export default function SpecializationsCRUD() {
  const { data: session } = useSession();
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Specialization | null>(null);
  const [formName, setFormName] = useState("");
  const [formDeptId, setFormDeptId] = useState<string>("");

  const schoolId = session?.user?.schoolId;

  const fetchData = async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const [specRes, deptRes] = await Promise.all([
        fetch(`/api/specializations?schoolId=${schoolId}`),
        fetch(`/api/departments?schoolId=${schoolId}`),
      ]);

      if (!specRes.ok) throw new Error("Failed to fetch specializations");
      const specs = await specRes.json();
      const depts = await deptRes.json();
      setSpecializations(specs || []);
      setDepartments(depts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchData();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormDeptId(departments[0]?.id?.toString() ?? "");
    setIsModalOpen(true);
  };

  const openEdit = (s: Specialization) => {
    setEditing(s);
    setFormName(s.name);
    setFormDeptId(s.departmentId?.toString() ?? "");
    setIsModalOpen(true);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formName || !formDeptId) return alert("Name and department required");
    try {
      const payload = { name: formName, departmentId: parseInt(formDeptId) };
      let res: Response;
      if (editing) {
        res = await fetch("/api/specializations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        res = await fetch("/api/specializations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save specialization");
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this specialization?")) return;
    try {
      const res = await fetch(`/api/specializations?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete specialization");
      }
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // group by department name
  const grouped = specializations.reduce(
    (acc: Record<string, Specialization[]>, s) => {
      const name =
        s.department?.name ||
        departments.find((d) => d.id === s.departmentId)?.name ||
        "No Department";
      if (!acc[name]) acc[name] = [];
      acc[name].push(s);
      return acc;
    },
    {}
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading specializations...</div>
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
        <h2 className="text-2xl font-bold text-white">Specializations</h2>
        <div className="flex gap-3">
          <button
            onClick={openCreate}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg"
          >
            + Add Specialization
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center text-gray-400">
            No specializations found.
          </div>
        ) : (
          Object.entries(grouped).map(([deptName, specs]) => (
            <div
              key={deptName}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
            >
              <div className="bg-black/30 px-6 py-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">{deptName}</h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {specs.map((sp) => (
                  <div
                    key={sp.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <span className="text-white font-medium">{sp.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(sp)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sp.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editing ? "Edit Specialization" : "Add Specialization"}
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department
                </label>
                <select
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select a department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-gray-900">
                      {d.name}
                    </option>
                  ))}
                </select>
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
