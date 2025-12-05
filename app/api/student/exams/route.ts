import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = prisma as any;

// GET /api/student/exams
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get student's group
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, groupId: true },
    });

    if (!student || !student.groupId) {
      return NextResponse.json({ exams: [] });
    }

    // Get exams for student's group
    const exams = await p.exam.findMany({
      where: {
        groupId: student.groupId,
      },
      include: {
        subject: true,
        room: true,
        grades: {
          where: {
            studentId: student.id,
          },
        },
      },
      orderBy: {
        examDate: "asc",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedExams = exams.map((exam: any) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      subject: exam.subject.name,
      date: exam.examDate,
      duration: exam.duration,
      room: exam.room?.name || "TBD",
      grade: exam.grades[0]?.grade?.toString() || null,
      note: exam.grades[0]?.note || null,
    }));

    return NextResponse.json({ exams: formattedExams });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
