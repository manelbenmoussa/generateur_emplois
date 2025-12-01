import { NextResponse } from "next/server";
import * as adminDao from "@/dao/administratorDao";
import { Administrator } from "@/types/entities";

interface CreateAdministratorRequest {
  userId: string;
  schoolId: number;
}

// GET /api/administrators?schoolId=1
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const schoolIdParam = url.searchParams.get("schoolId");
    const schoolId = schoolIdParam ? Number(schoolIdParam) : 1;

    if (!schoolId || Number.isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid schoolId" }, { status: 400 });
    }

    const admins: Administrator[] = await adminDao.getAdministratorsBySchool(
      schoolId
    );
    return NextResponse.json({ administrators: admins });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/administrators
// body: { userId, schoolId }
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAdministratorRequest;
    const { userId, schoolId } = body;

    if (!userId || !schoolId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const created: Administrator = await adminDao.createAdministrator({
      userId,
      schoolId: Number(schoolId),
    });

    return NextResponse.json({ administrator: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
