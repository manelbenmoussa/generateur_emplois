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

    const body = (await request.json()) as any;
    const { firstName, lastName, groupId } = body;

    const updated = await studentDao.updateStudent(id, {
      firstName,
      lastName,
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

    await studentDao.deleteStudent(id);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
