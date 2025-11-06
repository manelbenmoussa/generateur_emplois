import { NextResponse } from "next/server";
import * as adminDao from "@/dao/administratorDao";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
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
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = (await request.json()) as any;
    const { username, passwordHash } = body;

    const updated = await adminDao.updateAdministrator(id, {
      username,
      passwordHash,
    });
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
