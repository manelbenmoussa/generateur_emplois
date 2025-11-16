import { NextResponse } from "next/server";
import * as adminDao from "@/dao/administratorDao";
import { Administrator } from "@/types/entities";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const admin = await adminDao.getAdministratorById(id);
    if (!admin)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ administrator: admin });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const raw = (await request.json()) as Partial<Administrator> | undefined;
    if (!raw || typeof raw !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Only allow updating the administrator's school association here
    const { schoolId } = raw as Partial<Administrator>;
    const updates: Partial<Administrator> = {};
    if (schoolId !== undefined) {
      const schoolIdNum = Number(schoolId);
      if (!Number.isInteger(schoolIdNum) || schoolIdNum <= 0) {
        return NextResponse.json(
          { error: "Invalid schoolId" },
          { status: 400 }
        );
      }
      updates.schoolId = schoolIdNum;
    }

    const updated = await adminDao.updateAdministrator(id, updates);
    return NextResponse.json({ administrator: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await adminDao.deleteAdministrator(id);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
