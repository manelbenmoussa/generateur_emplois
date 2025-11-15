import { NextResponse } from "next/server";
import * as studentDao from "@/dao/studentDao";
import type { Student } from "@/types/entities";

// GET /api/students?schoolId=1
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const schoolIdParam = url.searchParams.get("schoolId");
    const schoolId = schoolIdParam ? Number(schoolIdParam) : 1; // default for testing

    if (!schoolId || Number.isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid schoolId" }, { status: 400 });
    }

    const students: Student[] = await studentDao.getStudentsBySchool(schoolId);
    return NextResponse.json(students);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/students
// body: { email, name, schoolId, groupId? }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, schoolId, groupId } = body;

    if (!schoolId) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Create or find user first
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("student123", 10);

    const prisma = (await import("@/dao/db")).default;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          password: hashedPassword,
          role: "STUDENT",
        },
      });
    }

    // Create student record
    const created = await studentDao.createStudent({
      userId: user.id,
      schoolId: Number(schoolId),
      groupId: groupId ? Number(groupId) : undefined,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/students
// body: { id, name?, groupId? }
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, groupId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing student id" },
        { status: 400 }
      );
    }

    const prisma = (await import("@/dao/db")).default;

    // Get the student first
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { name: name || null },
      });
    }

    // Update student group if provided
    const updated = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        groupId: groupId === "" || !groupId ? null : Number(groupId),
      },
      include: {
        user: true,
        group: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
