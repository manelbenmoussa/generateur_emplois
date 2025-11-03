import { NextResponse } from "next/server";
import * as teacherDao from "@/dao/teacherDao";
import type { Teacher } from "@/types/entities";

// GET /api/teachers?schoolId=1
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const schoolIdParam = url.searchParams.get("schoolId");
    const schoolId = schoolIdParam ? Number(schoolIdParam) : 1; // default for testing

    if (!schoolId || Number.isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid schoolId" }, { status: 400 });
    }

    const teachers: Teacher[] = await teacherDao.getTeachersBySchool(schoolId);
    return NextResponse.json({ teachers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, firstName, lastName, schoolId, subjectIds } = body;

    if (!schoolId) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const created = await teacherDao.createTeacher({
      userId,
      firstName,
      lastName,
      schoolId: Number(schoolId),
      subjectIds,
    });

    return NextResponse.json({ teacher: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
