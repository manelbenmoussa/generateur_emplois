"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import Card from "@/components/Card";
import DataTable from "@/components/DataTable";
import { isNotEmpty } from "@/lib/utils";

interface Room {
  id: number;
  name: string;
  capacity: number;
  schoolId: number;
  departmentId: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    schoolId: "1", // Default school ID - adjust as needed
    departmentId: "1", // Default department ID - adjust as needed
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rooms?schoolId=1"); // Adjust school ID as needed
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      alert("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!isNotEmpty(formData.name)) {
      setError("Room name is required");
      return false;
    }
    if (!isNotEmpty(formData.capacity) || parseInt(formData.capacity) <= 0) {
      setError("Valid capacity is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = editingRoom ? "/api/rooms" : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";
      const body = editingRoom
        ? {
            ...formData,
            id: editingRoom.id,
            capacity: parseInt(formData.capacity),
          }
        : { ...formData, capacity: parseInt(formData.capacity) };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save room");
      }

      alert(
        editingRoom ? "Room updated successfully" : "Room created successfully"
      );
      resetForm();
      fetchRooms();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      schoolId: room.schoolId.toString(),
      departmentId: room.departmentId.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete room "${room.name}"?`))
      return;

    try {
      const response = await fetch(`/api/rooms?id=${room.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete room");

      alert("Room deleted successfully");
      fetchRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", capacity: "", schoolId: "1", departmentId: "1" });
    setEditingRoom(null);
    setShowForm(false);
    setError("");
  };

  const columns = [
    { key: "id" as keyof Room, label: "ID" },
    { key: "name" as keyof Room, label: "Room Name" },
    { key: "capacity" as keyof Room, label: "Capacity" },
    { key: "actions" as keyof Room, label: "Actions" },
  ];

  const addButton = (
    <button
      onClick={() => setShowForm(!showForm)}
      style={{
        padding: "10px 20px",
        background: "var(--accent)",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px",
        transition: "all 0.2s",
      }}
    >
      {showForm ? "Cancel" : "+ Add Room"}
    </button>
  );

  return (
    <>
      <style jsx>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #0b1220;
        }
        .form-group input {
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .error-message {
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 12px;
          padding: 8px;
          background: #fee2e2;
          border-radius: 6px;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-primary {
          background: var(--accent);
          color: #fff;
        }
        .btn-primary:hover {
          background: #6b4423;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #0b1220;
        }
        .btn-secondary:hover {
          background: #cbd5e1;
        }
      `}</style>

      <AdminLayout
        title="Room Management"
        description="Manage classrooms, labs, and other facilities"
        actions={addButton}
      >
        {showForm && (
          <Card title={editingRoom ? "Edit Room" : "Add New Room"}>
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Room Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Room 101"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="capacity">Capacity *</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 30"
                    min="1"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? "Update Room" : "Add Room"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        <Card title="All Rooms">
          {loading ? (
            <p>Loading rooms...</p>
          ) : (
            <DataTable
              columns={columns}
              data={rooms}
              onEdit={handleEdit}
              onDelete={handleDelete}
              emptyMessage="No rooms found. Add your first room!"
            />
          )}
        </Card>
      </AdminLayout>
    </>
  );
}
