import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = prisma as any;

// GET /api/student/swap-requests
export async function GET() {
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

    const requests = await p.swapRequest.findMany({
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
        createdAt: "desc",
      },
    });

    return NextResponse.json({ requests });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/student/swap-requests
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { sessionId, requestType, reason } = body;

    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const swapRequest = await p.swapRequest.create({
      data: {
        studentId: student.id,
        sessionId: Number(sessionId),
        requestType,
        reason,
      },
    });

    return NextResponse.json({ request: swapRequest }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
