import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/dao/db";
const p = prisma as any;

// GET /api/student/messages
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const messages = await p.message.findMany({
      where: {
        OR: [
          { recipientId: userId },
          { recipientId: null }, // Broadcast messages
        ],
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/student/messages
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    await p.message.update({
      where: { id: Number(id) },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
