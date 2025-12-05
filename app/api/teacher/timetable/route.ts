import { NextResponse } from "next/server";
import { getSessionsByTeacherUserId } from "../../../../dao/sessionDao";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId query parameter" },
        { status: 400 }
      );
    }

    const sessions = await getSessionsByTeacherUserId(userId);

    // Map to a clean UI-friendly shape
    const payload = sessions.map((s) => ({
      id: s.id,
      subject: s.subject?.name ?? null,
      group: s.group ? { id: s.group.id, level: s.group.level } : null,
      specialization: s.group?.specialization?.name ?? null,
      room: s.room ? { id: s.room.id, name: s.room.name } : null,
      scheduled_weekday: s.scheduled_weekday ?? null,
      scheduled_time: s.scheduled_time ?? null,
      teacher: s.teacher
        ? { id: s.teacher.id, name: s.teacher.user?.name ?? null }
        : null,
    }));

    return NextResponse.json({ sessions: payload });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Error in /api/teacher/timetable:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
