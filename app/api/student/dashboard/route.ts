import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";

// GET /api/student/dashboard
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get student data with group
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        group: {
          include: {
            specialization: {
              include: {
                department: true,
              },
            },
          },
        },
        school: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get today's date info
    const today = new Date();
    const weekdays = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const currentWeekday = weekdays[today.getDay()];

    // Get today's sessions
    const todaySessions = await prisma.session.findMany({
      where: {
        groupId: student.groupId || undefined,
        scheduled_weekday: currentWeekday,
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
      orderBy: {
        scheduled_time: "asc",
      },
    });

    // Get this week's sessions for stats
    const allSessions = await prisma.session.findMany({
      where: {
        groupId: student.groupId || undefined,
      },
      include: {
        subject: true,
      },
    });

    // Calculate stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalHours = allSessions.reduce((sum: number, session: any) => {
      return sum + parseFloat(session.subject.hourVolume.toString());
    }, 0);

    // Get upcoming exams count (mock for now - you'll need to create exams table)
    const pendingExams = 0; // TODO: Implement exams table

    const stats = {
      totalHours: Math.round(totalHours),
      attendedHours: Math.round(totalHours * 0.85), // Mock attendance
      upcomingSessions: todaySessions.length,
      pendingExams,
    };

    // Format today's sessions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedSessions = todaySessions.map((session: any) => ({
      id: session.id,
      time: session.scheduled_time || "TBD",
      subject: session.subject.name,
      room: session.room?.name || "TBD",
      teacher: session.teacher?.user.name || "TBD",
      status: "upcoming",
    }));

    return NextResponse.json({
      stats,
      todaySessions: formattedSessions,
      studentInfo: {
        name: session.user.name,
        email: session.user.email,
        group: student.group?.level || "No Group",
        department: student.group?.specialization?.department?.name || "N/A",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
