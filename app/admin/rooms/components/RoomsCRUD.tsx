"use client";

import { useState, useEffect } from "react";
import { Room, Department } from "@/types/entities";
import { useSession } from "next-auth/react";

export default function RoomsCRUD() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    capacity: "",
    departmentId: "",
  });
  const [deptFormData, setDeptFormData] = useState({
    name: "",
  });

  const schoolId = session?.user?.schoolId;

  const fetchRooms = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/rooms?schoolId=${schoolId}`);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (!schoolId) return;

    try {
      const response = await fetch(`/api/departments?schoolId=${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchRooms();
      fetchDepartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!schoolId) {
      setError("No school associated with your account");
      return;
    }

    try {
      const payload = {
        name: roomFormData.name,
        capacity: parseInt(roomFormData.capacity),
        schoolId,
        departmentId: roomFormData.departmentId
          ? parseInt(roomFormData.departmentId)
          : null,
        ...(editingRoom && { id: editingRoom.id }),
      };

      const response = await fetch("/api/rooms", {
        method: editingRoom ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save room");
      }

      await fetchRooms();
      handleCloseRoomModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save room");
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!schoolId) {
      setError("No school associated with your account");
      return;
    }

    try {
      const payload = {
        name: deptFormData.name,
        schoolId,
        ...(editingDept && { id: editingDept.id }),
      };

      const response = await fetch("/api/departments", {
        method: editingDept ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save department");
      }

      await fetchDepartments();
      await fetchRooms(); // Refresh rooms to show updated department names
      handleCloseDeptModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save department"
      );
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetch(`/api/rooms?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete room");
      }

      await fetchRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete room");
    }
  };

  const handleDeleteDept = async (id: number) => {
    // Check if any room is assigned to this department
    const hasRooms = rooms.some((room) => room.departmentId === id);
    if (hasRooms) {
      setError(
        "Impossible to delete: This department is assigned to one or more rooms. Please reassign or delete those rooms first."
      );
      return;
    }
    // If no rooms assigned, delete directly (no extra confirmation)
    try {
      const response = await fetch(`/api/departments?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If backend returns a generic error, show the real reason if we know it
        setError(
          "Impossible to delete: This department is assigned to one or more rooms. Please reassign or delete those rooms first."
        );
        return;
      }

      await fetchDepartments();
      await fetchRooms();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete department"
      );
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      departmentId: room.departmentId?.toString() || "",
    });
    setIsRoomModalOpen(true);
  };

  const handleEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptFormData({
      name: dept.name,
    });
    setIsDeptModalOpen(true);
  };

  const handleCloseRoomModal = () => {
    setIsRoomModalOpen(false);
    setEditingRoom(null);
    setRoomFormData({ name: "", capacity: "", departmentId: "" });
    setError("");
  };

  const handleCloseDeptModal = () => {
    setIsDeptModalOpen(false);
    setEditingDept(null);
    setDeptFormData({ name: "" });
    setError("");
  };

  // Group rooms by department
  const groupedRooms = rooms.reduce((acc, room) => {
    const deptName = room.department?.name || "No Department";
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading rooms...</div>
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
        <h2 className="text-2xl font-bold text-white">Rooms & Departments</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeptModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            + Add Department
          </button>
          <button
            onClick={() => setIsRoomModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            + Add Room
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Departments Section */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Departments</h3>
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
                    onClick={() => handleEditDept(dept)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDept(dept.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rooms Section - Grouped by Department */}
      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center text-gray-400">
            No rooms found. Click &ldquo;Add Room&rdquo; to create one.
          </div>
        ) : (
          Object.entries(groupedRooms).map(([deptName, deptRooms]) => (
            <div
              key={deptName}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
            >
              <div className="bg-black/30 px-6 py-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">{deptName}</h3>
              </div>
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Room Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {deptRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-white font-medium">
                        {room.name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {room.capacity}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
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

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingRoom ? "Edit Room" : "Add New Room"}
            </h3>

            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={roomFormData.name}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={roomFormData.capacity}
                  onChange={(e) =>
                    setRoomFormData({
                      ...roomFormData,
                      capacity: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department (Optional)
                </label>
                <select
                  value={roomFormData.departmentId}
                  onChange={(e) =>
                    setRoomFormData({
                      ...roomFormData,
                      departmentId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-gray-900">
                    No Department
                  </option>
                  {departments.map((dept) => (
                    <option
                      key={dept.id}
                      value={dept.id}
                      className="bg-gray-900"
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseRoomModal}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
                >
                  {editingRoom ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingDept ? "Edit Department" : "Add New Department"}
            </h3>

            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={deptFormData.name}
                  onChange={(e) =>
                    setDeptFormData({ ...deptFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDeptModal}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg transition"
                >
                  {editingDept ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
