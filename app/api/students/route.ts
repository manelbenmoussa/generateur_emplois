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
    return NextResponse.json({ students });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/students
// body: { userId, schoolId, groupId? }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, schoolId, groupId } = body;

    if (!schoolId) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const created = await studentDao.createStudent({
      userId,
      schoolId: Number(schoolId),
      groupId: groupId === undefined ? undefined : Number(groupId),
    });

    return NextResponse.json({ student: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
