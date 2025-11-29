import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";

// GET /api/student/sessions
export async function GET(request: Request) {
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
        room: true,
      },
      orderBy: [{ scheduled_weekday: "asc" }, { scheduled_time: "asc" }],
    });

    const formattedSessions = sessions.map((s: any) => ({
      id: s.id,
      subject: s.subject.name,
      teacher: s.teacher?.user.name || "TBD",
      room: s.room?.name || "TBD",
      weekday: s.scheduled_weekday,
      time: s.scheduled_time,
      duration: s.subject.hourVolume.toString(),
    }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
