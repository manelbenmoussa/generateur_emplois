import { NextRequest, NextResponse } from "next/server";
import * as specializationDao from "@/dao/specializationDao";
import * as departmentDao from "@/dao/departmentDao";

// GET /api/specializations?schoolId=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    const specializations = await specializationDao.getSpecializationsBySchool(
      parseInt(schoolId)
    );

    return NextResponse.json(specializations);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create { name, departmentId }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, departmentId } = body;

    if (!name || !departmentId) {
      return NextResponse.json(
        { error: "name and departmentId required" },
        { status: 400 }
      );
    }

    // ensure department exists
    const dept = await departmentDao.getDepartmentById(parseInt(departmentId));
    if (!dept)
      return NextResponse.json(
        { error: "Invalid departmentId" },
        { status: 400 }
      );

    const created = await specializationDao.createSpecialization({
      name,
      departmentId: parseInt(departmentId),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT update { id, name, departmentId }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, departmentId } = body;

    if (!id || !name || !departmentId) {
      return NextResponse.json(
        { error: "id, name and departmentId required" },
        { status: 400 }
      );
    }

    const updated = await specializationDao.updateSpecialization(parseInt(id), {
      name,
      departmentId: parseInt(departmentId),
    });

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/specializations?id=123
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "id is required" }, { status: 400 });

    await specializationDao.deleteSpecialization(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
