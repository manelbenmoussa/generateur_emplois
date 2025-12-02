import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";

// GET /api/student/sessions
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
      return NextResponse.json({ sessions: [] });
    }

    // Get sessions
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
        group: true,
        room: true,
      },
      orderBy: [{ scheduled_weekday: "asc" }, { scheduled_time: "asc" }],
    });

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      subject: s.subject.name,
      teacher: s.teacher?.user.name || "TBD",
      room: s.room?.name || "TBD",
      weekday: s.scheduled_weekday,
      time: s.scheduled_time,
      // Calculate per-session duration. The scheduler splits subject.hourVolume
      // into sessions of ~1.5h slots. We compute how many slots were required
      // and divide the total hourVolume to get the per-session length.
      duration: ((): string => {
        try {
          const hv = Number(s.subject?.hourVolume ?? 1.5);
          const slotLen = 1.5; // hours per scheduled slot used by scheduler
          const slots = Math.max(1, Math.ceil(hv / slotLen));
          const per = hv / slots;
          return String(per);
        } catch {
          return String(1.5);
        }
      })(),
      // Group model exposes `level`; do not access `name` which may not exist on type
      group: s.group ? { id: s.group.id, level: s.group.level ?? null } : null,
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
