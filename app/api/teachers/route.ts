import { NextResponse } from "next/server";
import * as teacherDao from "@/dao/teacherDao";

// GET /api/teachers?schoolId=1
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const schoolIdParam = url.searchParams.get("schoolId");
    const schoolId = schoolIdParam ? Number(schoolIdParam) : 1; // default for testing

    if (!schoolId || Number.isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid schoolId" }, { status: 400 });
    }

    const teachers = await teacherDao.getTeachersBySchool(schoolId);
    return NextResponse.json({ teachers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/teachers
// body: { firstName?, lastName?, schoolId, expertSubjectIds? }
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const { firstName, lastName, schoolId, expertSubjectIds } = body;

    if (!schoolId) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    const created = await teacherDao.createTeacher({
      firstName,
      lastName,
      schoolId: Number(schoolId),
      expertSubjectIds: Array.isArray(expertSubjectIds)
        ? expertSubjectIds.map(Number)
        : undefined,
    });

    return NextResponse.json({ teacher: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
