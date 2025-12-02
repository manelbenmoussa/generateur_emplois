"use client";

import { useState, useEffect } from "react";

interface AvailabilityViewProps {
  userId?: string;
}

interface SwapRequest {
  id: number;
  requestType: string;
  reason: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  session: {
    subject: { name: string };
    room: { name: string } | null;
    scheduled_time: string | null;
    scheduled_weekday: string | null;
  };
}

interface Session {
  id: number;
  subject: string;
  weekday: string;
  time: string;
}

export default function AvailabilityView({}: AvailabilityViewProps) {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sessionId: "",
    requestType: "SWAP",
    reason: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, sessionsRes] = await Promise.all([
        fetch("/api/student/swap-requests"),
        fetch("/api/student/sessions"),
      ]);

      const requestsData = await requestsRes.json();
      const sessionsData = await sessionsRes.json();

      setRequests(requestsData.requests);
      setSessions(sessionsData.sessions);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/student/swap-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ sessionId: "", requestType: "SWAP", reason: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Availability / Swap Requests 🔄
          </h2>
          <p className="text-gray-300">Request swaps or extra help slots</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
        >
          + New Request
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">My Requests</h3>
        {requests.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No requests yet</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {request.requestType === "SWAP"
                        ? "Session Swap"
                        : "Extra Help"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {request.session.subject.name} -{" "}
                      {request.session.scheduled_weekday} at{" "}
                      {request.session.scheduled_time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      request.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : request.status === "APPROVED"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  💬 {request.reason}
                </div>
                {request.adminResponse && (
                  <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-gray-300">
                    👨‍💼 Admin: {request.adminResponse}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Requested: {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-6">New Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session
                </label>
                <select
                  required
                  value={formData.sessionId}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-gray-900">
                    Select a session
                  </option>
                  {sessions.map((session) => (
                    <option
                      key={session.id}
                      value={session.id}
                      className="bg-gray-900"
                    >
                      {session.subject} - {session.weekday} at {session.time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Request Type
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) =>
                    setFormData({ ...formData, requestType: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SWAP" className="bg-gray-900">
                    Session Swap
                  </option>
                  <option value="HELP" className="bg-gray-900">
                    Extra Help
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain your request..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
