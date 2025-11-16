import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createSession,
  updateSession,
  deleteSession,
  getSessionsBySchool,
} from "@/dao/sessionDao";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const schoolId = session.user?.schoolId;
  if (!schoolId) {
    return NextResponse.json(
      { error: "No school associated with your account." },
      { status: 400 }
    );
  }
  const sessions = await getSessionsBySchool(Number(schoolId));
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const schoolId = session.user?.schoolId;
  if (!schoolId) {
    return NextResponse.json(
      { error: "No school associated with your account." },
      { status: 400 }
    );
  }
  const body = await req.json();
  try {
    const created = await createSession({
      ...body,
      schoolId: Number(schoolId),
    });
    return NextResponse.json({ session: created });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Failed to create session";
    return NextResponse.json({ error }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  try {
    const updated = await updateSession(body);
    return NextResponse.json({ session: updated });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Failed to update session";
    return NextResponse.json({ error }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  try {
    await deleteSession(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "Failed to delete session";
    return NextResponse.json({ error }, { status: 400 });
  }
}
