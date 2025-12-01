import { NextRequest, NextResponse } from "next/server";
import {
  getRoomsBySchool,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomByName,
} from "@/dao/roomDao";

// GET: Fetch all rooms for a school
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    const rooms = await getRoomsBySchool(parseInt(schoolId));
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST: Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, capacity, schoolId, departmentId } = body;

    // Validation - departmentId is optional
    if (!name || !capacity || !schoolId) {
      return NextResponse.json(
        { error: "name, capacity, and schoolId are required" },
        { status: 400 }
      );
    }

    // Check for duplicate room name
    const existingRoom = await getRoomByName(name, parseInt(String(schoolId)));
    if (existingRoom) {
      return NextResponse.json(
        { error: "A room with this name already exists in this school" },
        { status: 409 }
      );
    }

    const newRoom = await createRoom({
      name,
      capacity: parseInt(String(capacity)),
      schoolId: parseInt(String(schoolId)),
      departmentId: departmentId ? parseInt(String(departmentId)) : null,
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

// PUT: Update a room
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, capacity, schoolId, departmentId } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Check for duplicate room name (excluding current room)
    if (name && schoolId) {
      const existingRoom = await getRoomByName(
        name,
        parseInt(String(schoolId))
      );
      if (existingRoom && existingRoom.id !== parseInt(String(id))) {
        return NextResponse.json(
          { error: "A room with this name already exists in this school" },
          { status: 409 }
        );
      }
    }

    const updateData: {
      name?: string;
      capacity?: number;
      schoolId?: number;
      departmentId?: number | null;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined)
      updateData.capacity = parseInt(String(capacity));
    if (schoolId !== undefined)
      updateData.schoolId = parseInt(String(schoolId));
    if (departmentId !== undefined)
      updateData.departmentId = departmentId
        ? parseInt(String(departmentId))
        : null;

    const updatedRoom = await updateRoom(parseInt(String(id)), updateData);
    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a room
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteRoom(parseInt(id));
    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
