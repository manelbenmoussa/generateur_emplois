import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";

// GET /api/student/absences
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const absences = await prisma.absence.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        session: {
          include: {
            subject: true,
            room: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const formattedAbsences = absences.map((absence: any) => ({
      id: absence.id,
      date: absence.date,
      subject: absence.session.subject.name,
      room: absence.session.room?.name || "TBD",
      time: absence.session.scheduled_time || "TBD",
      justified: absence.justified,
      reason: absence.reason,
    }));

    return NextResponse.json({ absences: formattedAbsences });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
