import { NextResponse } from "next/server";
import * as studentDao from "@/dao/studentDao";

// GET /api/students/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const student = await studentDao.getStudentById(id);
    if (!student)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ student });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/students/:id
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const { groupId } = body;

    const updated = await studentDao.updateStudent(id, {
      groupId:
        groupId === undefined
          ? undefined
          : groupId === null
          ? null
          : Number(groupId),
    });

    return NextResponse.json({ student: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/students/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Get the student first to find the userId
    const student = await studentDao.getStudentById(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete the student record first (due to foreign key constraint)
    await studentDao.deleteStudent(id);

    // Then delete the user account
    const prisma = (await import("@/dao/db")).default;
    await prisma.user.delete({ where: { id: student.userId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
