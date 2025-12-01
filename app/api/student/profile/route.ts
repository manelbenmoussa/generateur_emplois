import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";
import * as userDao from "@/dao/userDao";

// GET /api/student/profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
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
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        group: student.group?.level || "No Group",
        department: student.group?.specialization?.department?.name || "N/A",
        school: student.school.name,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/student/profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, phone } = body;

    // Update user info
    await userDao.updateUser(userId, {
      name: name || undefined,
    });

    // TODO: Add phone field to schema if needed

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
