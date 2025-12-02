"use client";

import { useState, useEffect, useCallback } from "react";
// Logout is available on the home page; settings view does not include logout

export default function SettingsView() {
  // router not needed since logout is removed from this view
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    groupId: null as number | null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState<Array<{ id: number; level: string }>>(
    []
  );
  type GroupDto = { id: number; level?: string | null; name?: string | null };

  const fetchGroups = useCallback(async (schoolId: number) => {
    try {
      const resp = await fetch(`/api/groups?schoolId=${schoolId}`);
      if (!resp.ok) return;
      const data = (await resp.json()) as GroupDto[];
      // data is an array of groups
      setGroups(
        (data || []).map((g) => ({ id: g.id, level: g.level || g.name || String(g.id) }))
      );
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/student/profile");
        const data = await response.json();

        if (!mounted) return;
        if (data.profile) {
          setProfile({
            name: data.profile.name || "",
            email: data.profile.email || "",
            groupId: data.profile.groupId ?? null,
          });

          // If we have a schoolId, fetch groups for selection
          if (data.profile.schoolId) {
            fetchGroups(data.profile.schoolId);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [fetchGroups]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          groupId: profile.groupId,
        }),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // handleLogout removed — logout is handled on the home page

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          Settings & Profile ⚙️
        </h2>
        <p className="text-gray-300">Manage your account</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Settings (only) */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">
            Profile Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group
              </label>
              <select
                value={profile.groupId ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    groupId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-gray-900">
                    {g.level}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Logout is available on the Home page; removed from settings view */}
    </div>
  );
}
