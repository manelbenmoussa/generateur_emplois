import { NextRequest, NextResponse } from "next/server";
import prisma from "@/dao/db";

// GET: Fetch all subjects for a school or department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const departmentId = searchParams.get("departmentId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = {
      department: {
        schoolId: parseInt(schoolId),
      },
    };

    // Filter by department if provided
    if (departmentId) {
      whereClause.departmentId = parseInt(departmentId);
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// POST: Create a new subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, hourVolume, departmentId } = body;

    // Validation
    if (!name || !hourVolume || !departmentId) {
      return NextResponse.json(
        { error: "name, hourVolume, and departmentId are required" },
        { status: 400 }
      );
    }

    // Validate hour volume
    const hours = parseFloat(String(hourVolume));
    if (isNaN(hours) || hours <= 0) {
      return NextResponse.json(
        { error: "hourVolume must be a positive number" },
        { status: 400 }
      );
    }

    // Check for duplicate subject name in the same department
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name,
        departmentId: parseInt(String(departmentId)),
      },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "A subject with this name already exists in this department" },
        { status: 409 }
      );
    }

    const newSubject = await prisma.subject.create({
      data: {
        name,
        hourVolume: hours,
        departmentId: parseInt(String(departmentId)),
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}

// PUT: Update a subject
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, hourVolume, departmentId } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: parseInt(String(id)) },
    });

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check for duplicate name (excluding current subject)
    if (name && departmentId) {
      const duplicate = await prisma.subject.findFirst({
        where: {
          name,
          departmentId: parseInt(String(departmentId)),
          NOT: {
            id: parseInt(String(id)),
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error: "A subject with this name already exists in this department",
          },
          { status: 409 }
        );
      }
    }

    const updateData: {
      name?: string;
      hourVolume?: number;
      departmentId?: number;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (hourVolume !== undefined) {
      const hours = parseFloat(String(hourVolume));
      if (isNaN(hours) || hours <= 0) {
        return NextResponse.json(
          { error: "hourVolume must be a positive number" },
          { status: 400 }
        );
      }
      updateData.hourVolume = hours;
    }
    if (departmentId !== undefined)
      updateData.departmentId = parseInt(String(departmentId));

    const updatedSubject = await prisma.subject.update({
      where: { id: parseInt(String(id)) },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a subject
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const subjectId = parseInt(id);

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if subject is used in sessions
    const sessionsCount = await prisma.session.count({
      where: { subjectId },
    });

    if (sessionsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete subject. It is used in ${sessionsCount} session(s)`,
        },
        { status: 409 }
      );
    }

    // Check if subject is assigned to teachers
    const teachersCount = await prisma.teacherSubject.count({
      where: { subjectId },
    });

    if (teachersCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete subject. It is assigned to ${teachersCount} teacher(s)`,
        },
        { status: 409 }
      );
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
