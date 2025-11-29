import { NextResponse } from "next/server";
import * as teacherDao from "@/dao/teacherDao";

// GET /api/teachers/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const teacher = await teacherDao.getTeacherById(id);
    if (!teacher)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ teacher });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/teachers/:id
// body: { expertSubjectIds? }
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = (await request.json()) as {
      expertSubjectIds?: number[] | null;
    };
    const { expertSubjectIds } = body;

    // The DAO expects `subjectIds`. Allow clients to send `expertSubjectIds` and
    // map it to the DAO shape. undefined -> no change, null -> clear, array -> set
    const subjectIds =
      expertSubjectIds === undefined
        ? undefined
        : Array.isArray(expertSubjectIds)
        ? expertSubjectIds.map(Number)
        : null;

    const updated = await teacherDao.updateTeacher(id, {
      subjectIds,
    });

    return NextResponse.json({ teacher: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/teachers/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await teacherDao.deleteTeacher(id);
    // Return 200 with success body (204 must not include a body)
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
