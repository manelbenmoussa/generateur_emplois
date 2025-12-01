"use client";

import { useEffect, useState } from "react";

type Profile = {
  id: string;
  name?: string | null;
  email: string;
};

export default function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setProfile(data.user || null);
        setName(data.user?.name ?? "");
        setEmail(data.user?.email ?? "");
      })
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const body: any = { name, email };
      if (password) body.password = password;

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      setProfile(data.user);
      setSuccess("Profile updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-white">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Profile</h2>

      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}

      <div className="bg-white/5 p-6 rounded-xl">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-200 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-200 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full px-3 py-2 rounded bg-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-200 mb-1">New password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full px-3 py-2 rounded bg-white/10 text-white"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-200 mb-1">Confirm password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              className="w-full px-3 py-2 rounded bg-white/10 text-white"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
