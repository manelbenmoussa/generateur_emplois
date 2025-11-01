import { NextResponse } from "next/server";
import * as studentDao from "@/dao/studentDao";

// GET /api/students?schoolId=1
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const schoolIdParam = url.searchParams.get("schoolId");
    const schoolId = schoolIdParam ? Number(schoolIdParam) : 1; // default for testing

    if (!schoolId || Number.isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid schoolId" }, { status: 400 });
    }

    const students = await studentDao.getStudentsBySchool(schoolId);
    return NextResponse.json({ students });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/students
// body: { firstName?, lastName?, schoolId, groupId? }
export async function POST(request: Request) {
  try {
    const body = (await request.json());
    const { firstName, lastName, schoolId, groupId } = body;

    if (!schoolId) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    const created = await studentDao.createStudent({
      firstName,
      lastName,
      schoolId: Number(schoolId),
      groupId: groupId === undefined ? undefined : Number(groupId),
    });

    return NextResponse.json({ student: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
