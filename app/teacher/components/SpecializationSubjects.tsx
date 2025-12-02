"use client";

import { useEffect, useState } from "react";

type Subject = {
  id: number;
  name: string;
};

type SpecializationGroup = {
  id: number;
  name: string;
  subjects: Subject[];
};

type DepartmentGroup = {
  id: number;
  name: string;
  specializations: SpecializationGroup[];
};

export default function SpecializationSubjects() {
  const [departments, setDepartments] = useState<DepartmentGroup[]>([]);
  const [assigned, setAssigned] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/teacher/subjects");
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Failed to load subjects");
          setDepartments([]);
          setAssigned([]);
        } else {
          setDepartments(data.departments || []);
          setAssigned(data.assignedSubjectIds || []);
        }
      } catch (err) {
        setError(err?.message ?? "Network error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const toggle = (id: number) => {
    setAssigned((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectIds: assigned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to save");
      }
    } catch (err) {
      setError(err?.message ?? "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-3">
        Subjects of Specialization
      </h3>
      <div className="p-4 bg-white/5 border border-white/20 rounded">
        {loading && <p className="text-sm text-gray-200">Loading...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!loading && (
          <div>
            <p className="text-sm text-gray-200 mb-4">
              Select the subjects you are qualified to teach, grouped by
              department and specialization:
            </p>
            <div className="space-y-4 mb-4">
              {departments.map((dept) => (
                <div key={dept.id}>
                  <div className="text-lg font-semibold text-white mb-2">
                    {dept.name}
                  </div>
                  <div className="space-y-2">
                    {dept.specializations.map((spec) => (
                      <details key={spec.id} className="bg-white/6 p-3 rounded">
                        <summary className="cursor-pointer text-sm font-medium text-white">
                          {spec.name} ({spec.subjects.length})
                        </summary>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {spec.subjects.map((s) => (
                            <label
                              key={s.id}
                              className="inline-flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={assigned.includes(s.id)}
                                onChange={() => toggle(s.id)}
                                className="form-checkbox h-4 w-4"
                              />
                              <span className="text-sm text-gray-200">
                                {s.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                {saving ? "Saving..." : "Save Specializations"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
