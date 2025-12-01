import { NextRequest, NextResponse } from "next/server";
import prisma from "@/dao/db";

// GET: Fetch all groups for a school
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

    const groups = await prisma.group.findMany({
      where: {
        specialization: {
          department: {
            schoolId: parseInt(schoolId),
          },
        },
      },
      include: {
        specialization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { level: "asc" },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST: Create a new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, specializationId } = body;

    if (!specializationId) {
      return NextResponse.json(
        { error: "specializationId is required" },
        { status: 400 }
      );
    }

    const newGroup = await prisma.group.create({
      data: {
        level: level || null,
        specializationId: parseInt(String(specializationId)),
      },
      include: {
        specialization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}

// PUT: Update a group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, level, specializationId } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updateData: {
      level?: string | null;
      specializationId?: number;
    } = {};

    if (level !== undefined) updateData.level = level || null;
    if (specializationId !== undefined)
      updateData.specializationId = parseInt(String(specializationId));

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(String(id)) },
      data: updateData,
      include: {
        specialization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const groupId = parseInt(id);

    // Check if group has students
    const studentsCount = await prisma.student.count({
      where: { groupId },
    });

    if (studentsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete group. It has ${studentsCount} student(s) assigned`,
        },
        { status: 409 }
      );
    }

    await prisma.group.delete({
      where: { id: groupId },
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
