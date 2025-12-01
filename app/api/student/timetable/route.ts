import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";

// GET /api/student/timetable
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get student's group
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { groupId: true },
    });

    if (!student || !student.groupId) {
      return NextResponse.json({ error: "No group assigned" }, { status: 404 });
    }

    // Get all sessions for the student's group
    const sessions = await prisma.session.findMany({
      where: {
        groupId: student.groupId,
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
        room: true,
        group: true,
      },
      orderBy: [{ scheduled_weekday: "asc" }, { scheduled_time: "asc" }],
    });

    // Group sessions by weekday
    const weekdays = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ];
    const timetable = weekdays.map((day) => ({
      day,
      sessions: sessions
        .filter((s) => s.scheduled_weekday === day)
        .map((s) => ({
          id: s.id,
          subject: s.subject.name,
          teacher: s.teacher?.user.name || "TBD",
          room: s.room?.name || "TBD",
          time: s.scheduled_time || "TBD",
          duration: s.subject.hourVolume.toString(),
        })),
    }));

    return NextResponse.json({ timetable });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
