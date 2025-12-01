import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { role, schoolId } = body;

    const validRoles = ["ADMIN", "TEACHER", "STUDENT"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // For teacher/admin/student we need a schoolId
    if (
      (role === "TEACHER" || role === "STUDENT" || role === "ADMIN") &&
      !schoolId
    ) {
      return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
    }

    const userId = session.user.id;

    // Update user role
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Create corresponding role record if not exists
    if (role === "ADMIN") {
      await prisma.administrator.upsert({
        where: { userId: userId },
        update: { schoolId: parseInt(schoolId) },
        create: { userId: userId, schoolId: parseInt(schoolId) },
      });
    } else if (role === "TEACHER") {
      await prisma.teacher.upsert({
        where: { userId: userId },
        update: { schoolId: parseInt(schoolId) },
        create: { userId: userId, schoolId: parseInt(schoolId) },
      });
    } else if (role === "STUDENT") {
      await prisma.student.upsert({
        where: { userId: userId },
        update: { schoolId: parseInt(schoolId) },
        create: { userId: userId, schoolId: parseInt(schoolId) },
      });
    }

    return NextResponse.json(
      {
        message: "Role confirmed",
        user: { id: updated.id, role: updated.role },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Confirm role error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
