import { NextResponse } from "next/server";
import prisma from "../../../../dao/db";

export async function GET() {
  try {
    const teachers = await prisma.teacher.count();
    const students = await prisma.student.count();
    const scheduledSessions = await prisma.session.count({
      where: { scheduled_time: { not: null } },
    });

    return NextResponse.json({ teachers, students, scheduledSessions });
  } catch (err) {
    console.error("Failed to fetch admin stats", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
